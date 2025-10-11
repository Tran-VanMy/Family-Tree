// family-tree/client/src/components/FamilyTree/index.jsx
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

  // Load persons + relations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const personsRes = await api.get("/persons");
        const relationsRes = await api.get("/relations");

        const fetchedNodes = personsRes.data.map((p) => ({
          id: p.id.toString(),
          type: "person",
          position: {
            x: typeof p.position_x === "number" ? p.position_x : Math.random() * 400,
            y: typeof p.position_y === "number" ? p.position_y : Math.random() * 400,
          },
          data: {
            person: p,
            onDelete: handleDeletePerson,
          },
        }));

        const fetchedEdges = relationsRes.data.map((r) => ({
          id: r.id.toString(),
          source: r.source_id.toString(),
          target: r.target_id.toString(),
          label: r.label || "",
          type: "step",
        }));

        setNodes(fetchedNodes);
        setNodes((nds) =>
          nds.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onOpen: () => {
                // luôn tìm person mới nhất theo id
                const latest = nds.find((n) => n.id === node.id);
                const personData = latest ? latest.data.person : node.data.person;
                setSelectedPerson(personData);
                setOpenPersonModal(true);
              },
            },
          }))
        );

        setEdges(fetchedEdges);
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
        avatar_url: personData.avatar_url ?? null,
        position_x: personData.position_x ?? 200,
        position_y: personData.position_y ?? 200,
        gender: personData.gender ?? null,
        notes: personData.notes ?? null,
      };

      const res = await api.post("/persons", payload);
      const p = res.data;
      const newNode = {
        id: p.id.toString(),
        type: "person",
        position: { x: p.position_x ?? 200, y: p.position_y ?? 200 },
        data: {
          person: p,
          onDelete: handleDeletePerson,
          onOpen: () => {
            setSelectedPerson(p);
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
        setNodes((nds) => nds.filter((n) => n.id !== id.toString()));
        setEdges((eds) => eds.filter((e) => e.source !== id.toString() && e.target !== id.toString()));
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
      const payload = {
        source_id: pendingEdge.source,
        target_id: pendingEdge.target,
        type: relation.type,
        label: relation.label,
      };

      const res = await api.post("/relations", payload);
      const created = res.data;

      setEdges((eds) =>
        addEdge(
          {
            id: created.id.toString(),
            source: created.source_id.toString(),
            target: created.target_id.toString(),
            label: created.label,
            type: "step",
          },
          eds
        )
      );

      setOpenModal(false);
      setPendingEdge(null);
    } catch (err) {
      console.error("Create relation failed", err);
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
      const updated = res.data;

      // Cập nhật node trong cây
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, person: updated } } : n
        )
      );

      // Cập nhật selectedPerson để modal hiển thị dữ liệu mới nếu mở lại
      setSelectedPerson((prev) =>
        prev && prev.id === id ? updated : prev
      );

      // Trả về dữ liệu mới (để modal có thể dùng nếu muốn)
      return updated;
    } catch (err) {
      console.error("Update person failed", err);
      throw err;
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('ft_user')
    localStorage.removeItem('ft_tree')
    navigate('/login')
  }

  // //  Luôn đồng bộ lại hàm onOpen của mỗi node để modal luôn thấy dữ liệu mới nhất
  // useEffect(() => {
  //   setNodes((nds) =>
  //     nds.map((node) => ({
  //       ...node,
  //       data: {
  //         ...node.data,
  //         onOpen: () => {
  //           // lấy person mới nhất từ state hiện tại
  //           const latest = nds.find((n) => n.id === node.id);
  //           const personData = latest ? latest.data.person : node.data.person;
  //           setSelectedPerson(personData);
  //           setOpenPersonModal(true);
  //         },
  //       },
  //     }))
  //   );
  // }, [nodes]);


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