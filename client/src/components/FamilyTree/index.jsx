// client/src/components/FamilyTree/index.jsx
import React, { useEffect, useCallback, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionMode,
} from "reactflow";
import "reactflow/dist/style.css";
import api from "../../services/api";
import PersonNode from "./PersonNode";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import RelationModal from "../RelationModal";
import PersonDetailModal from "../PersonDetailModal";
import "./FamilyTree.css";
import { useNavigate } from "react-router-dom";

const nodeTypes = { person: PersonNode };

export default function FamilyTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingEdge, setPendingEdge] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [openPersonModal, setOpenPersonModal] = useState(false);

  const navigate = useNavigate();

  // If no user -> redirect to login
  useEffect(() => {
    const userStr = localStorage.getItem('ft_user')
    if (!userStr) navigate('/login')
  }, [navigate])

  // Load persons + relations (now fetch /persons, /marriages, /parent-child)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const personsRes = await api.get("/persons");
        // fetch marriages and parent-child separately
        const marriagesRes = await api.get("/marriages");
        const parentChildRes = await api.get("/parent-child");

        // normalize persons: backend returns person_id; map to id for frontend convenience
        const fetchedNodes = (personsRes.data || []).map((p) => {
          const id = String(p.person_id ?? p.id)
          return {
            id,
            type: "person",
            position: {
              x: typeof p.position_x === "number" ? p.position_x : Math.random() * 400,
              y: typeof p.position_y === "number" ? p.position_y : Math.random() * 400,
            },
            data: {
              person: { ...p, id },
              onDelete: handleDeletePerson,
            },
          }
        })

        // marriages -> edges (spouse relations)
        const marriageEdges = (marriagesRes.data || []).map((m) => ({
          id: `m-${m.marriage_id}`,
          source: String(m.spouse1_id),
          target: String(m.spouse2_id),
          label: m.note || (m.status ?? 'Kết hôn'),
          type: "step",
        }))

        // parent_child -> edges
        const pcEdges = (parentChildRes.data || []).map((pc) => ({
          id: `pc-${pc.parent_child_id}`,
          source: String(pc.parent_id),
          target: String(pc.child_id),
          label: pc.relationship || "",
          type: "step",
        }))

        setNodes(fetchedNodes)
        // set onOpen handlers so modal luôn lấy person từ current state
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onOpen: () => {
                const latest = nds.find((n) => n.id === node.id);
                const personData = latest ? latest.data.person : node.data.person;
                setSelectedPerson(personData);
                setOpenPersonModal(true);
              },
            },
          }))
        );

        setEdges([...marriageEdges, ...pcEdges])
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add person
  const handleAddPerson = async (personData) => {
    try {
      const payload = {
        name: personData.name,
        birth_date: personData.birth_date ?? null,
        death_date: personData.death_date ?? null,
        // avatar_url removed because server schema doesn't include it
        position_x: personData.position_x ?? 200,
        position_y: personData.position_y ?? 200,
        gender: personData.gender ?? null,
        notes: personData.notes ?? null,
      };

      const res = await api.post("/persons", payload);
      const p = res.data;
      // normalize id
      const id = String(p.person_id ?? p.id)
      const newNode = {
        id,
        type: "person",
        position: { x: p.position_x ?? 200, y: p.position_y ?? 200 },
        data: {
          person: { ...p, id },
          onDelete: handleDeletePerson,
          onOpen: () => {
            setSelectedPerson({ ...p, id });
            setOpenPersonModal(true);
          },
        },
      };
      setNodes((nds) => nds.concat(newNode));
      return p;
    } catch (err) {
      console.error("Add person failed", err);
      throw err;
    }
  };

  // Delete person
  const handleDeletePerson = useCallback(
    async (id) => {
      try {
        await api.delete(`/persons/${id}`);
        setNodes((nds) => nds.filter((n) => n.id !== String(id)));
        setEdges((eds) => eds.filter((e) => e.source !== String(id) && e.target !== String(id)));
      } catch (err) {
        console.error("Delete failed", err);
      }
    },
    [setNodes, setEdges]
  );

  // Connect -> open relation modal
  const onConnect = useCallback((params) => {
    setPendingEdge(params);
    setOpenModal(true);
  }, []);

const handleSaveRelation = async (relation) => {
  try {
    if (!pendingEdge) return;
    const source = pendingEdge.source;
    const target = pendingEdge.target;

    let created = null;

    // 💍 HÔN NHÂN
    if (relation.type === "marriage") {
      const res = await api.post("/marriages", {
        spouse1_id: Number(source),
        spouse2_id: Number(target),
        status: relation.status || "Kết hôn",
        note: relation.label || "",
      });

      created = res.data;

      setEdges((eds) =>
        addEdge(
          {
            id: `m-${created.marriage_id}`,
            source: String(created.spouse1_id),
            target: String(created.spouse2_id),
            label: created.status, // ✅ hiển thị “Kết hôn” hoặc “Ly hôn”
            type: "step",
          },
          eds
        )
      );
    }

    // 👨‍👩‍👧 CHA MẸ - CON
    else if (relation.type === "parent_child") {
      const res = await api.post("/parent-child", {
        parent_id: Number(source),
        child_id: Number(target),
        relationship:
          relation.relationship?.trim() ||
          relation.label?.trim() ||
          "Con ruột",
      });

      created = res.data;

      setEdges((eds) =>
        addEdge(
          {
            id: `pc-${created.parent_child_id}`,
            source: String(created.parent_id),
            target: String(created.child_id),
            label: created.relationship,
            type: "step",
          },
          eds
        )
      );
    }

    // 🧩 fallback cho các loại khác
    else {
      const res = await api.post("/parent-child", {
        parent_id: Number(source),
        child_id: Number(target),
        relationship: relation.label || "Quan hệ",
      });
      created = res.data;

      setEdges((eds) =>
        addEdge(
          {
            id: `pc-${created.parent_child_id}`,
            source: String(created.parent_id),
            target: String(created.child_id),
            label: created.relationship,
            type: "step",
          },
          eds
        )
      );
    }

    setOpenModal(false);
    setPendingEdge(null);
  } catch (err) {
    console.error("❌ Create relation failed:", err);
    setOpenModal(false);
    setPendingEdge(null);
  }
};




  // Update node position when dragging
  const onNodeDragStop = useCallback(
    async (event, node) => {
      try {
        await api.patch(`/persons/${node.id}`, {
          position_x: node.position.x,
          position_y: node.position.y,
        });
        setNodes((nds) =>
          nds.map((n) => (n.id === node.id ? { ...n, position: node.position } : n))
        );
      } catch (err) {
        console.error("Update position failed", err);
      }
    },
    [setNodes]
  );

  const personsList = nodes.map((n) => n.data?.person).filter(Boolean);

  // Update person (called from PersonDetailModal)
  const handleUpdatePerson = async (id, payload) => {
    try {
      const res = await api.patch(`/persons/${id}`, payload);
      const updatedRaw = res.data;
      const updated = { ...updatedRaw, id: String(updatedRaw.person_id ?? updatedRaw.id) };

      setNodes((nds) =>
        nds.map((n) =>
          n.id === String(id) ? { ...n, data: { ...n.data, person: updated } } : n
        )
      );

      setSelectedPerson((prev) =>
        prev && String(prev.id) === String(id) ? updated : prev
      );

      return updated;
    } catch (err) {
      console.error("Update person failed", err);
      throw err;
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('ft_user')
    localStorage.removeItem('ft_family')
    localStorage.removeItem('ft_tree')
    navigate('/login')
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar
          onAddPerson={handleAddPerson}
          persons={personsList}
          onDeletePerson={handleDeletePerson}
          onOpenPerson={(p) => {
            setSelectedPerson(p)
            setOpenPersonModal(true)
          }} />
      </div>

      <div className="flow-container">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onConnect={onConnect}
            connectionMode={ConnectionMode.Loose}
            fitView
            defaultEdgeOptions={{ type: "step", animated: true }}
          >
            <Background />
            <Controls />
          </ReactFlow>

          <RelationModal
            open={openModal}
            onClose={() => {
              setOpenModal(false)
              setPendingEdge(null)
            }}
            onSave={handleSaveRelation}
          />

          <PersonDetailModal
            open={openPersonModal}
            onClose={() => {
              setOpenPersonModal(false)
              setSelectedPerson(null)
            }}
            person={selectedPerson}
            onSave={handleUpdatePerson}
          />
        </ReactFlowProvider>
      </div>

      <div className="right-sidebar">
        <RightSidebar
          persons={personsList}
          onDeletePerson={handleDeletePerson}
          onOpenPerson={(p) => {
            setSelectedPerson(p)
            setOpenPersonModal(true)
          }}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
