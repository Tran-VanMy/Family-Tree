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
import RelationModal from "../RelationModal";
import PersonDetailModal from "../PersonDetailModal"; // mới import modal chi tiết
import "./FamilyTree.css";

const nodeTypes = { person: PersonNode };

export default function FamilyTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingEdge, setPendingEdge] = useState(null); // edge đang chờ nhập label/type
  const [openModal, setOpenModal] = useState(false);

  // Mới: selected person để hiển thị modal chi tiết
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [openPersonModal, setOpenPersonModal] = useState(false);

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
            // onOpen để mở modal chi tiết của person
            onOpen: () => {
              setSelectedPerson(p);
              setOpenPersonModal(true);
            },
          },
        }));

        const fetchedEdges = relationsRes.data.map((r) => ({
          id: r.id.toString(),
          source: r.source_id.toString(),
          target: r.target_id.toString(),
          label: r.label || "",
          type: "step", // always horizontal/vertical
        }));

        setNodes(fetchedNodes);
        setEdges(fetchedEdges);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add person (now accepts an object with name, birth_date, death_date, avatar_url, optionally position_x/y, gender, notes)
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

  // Khi nối node → mở modal để nhập label/type
  const onConnect = useCallback((params) => {
    setPendingEdge(params);
    setOpenModal(true);
  }, []);

  // Lưu quan hệ sau khi nhập label/type
  // Lưu ý: onSave từ RelationModal giờ trả về { type, label }
  const handleSaveRelation = async (relation) => {
    try {
      if (!pendingEdge) return;
      const payload = {
        source_id: pendingEdge.source,
        target_id: pendingEdge.target,
        type: relation.type, // ví dụ 'spouse' / 'parent_child' / 'sibling'
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
            type: "step", // force step edges
          },
          eds
        )
      );

      setOpenModal(false);
      setPendingEdge(null);
    } catch (err) {
      console.error("Create relation failed", err);
    }
  };

  // Lưu vị trí node khi drag
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

  // Prepare persons list to pass to Sidebar (simple array of person objects)
  const personsList = nodes.map((n) => n.data?.person).filter(Boolean);

  return (
    <div className="app-container" style={{ display: "flex", height: "100%" }}>
      <div className="sidebar">
        <Sidebar onAddPerson={handleAddPerson} persons={personsList} onDeletePerson={handleDeletePerson} />
      </div>

      <div className="flow-container" style={{ flex: 1, height: "100%" }}>
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

          {/* Modal nhập quan hệ */}
          <RelationModal
            open={openModal}
            onClose={() => {
              setOpenModal(false)
              setPendingEdge(null)
            }}
            onSave={handleSaveRelation}
          />

          {/* Modal hiển thị chi tiết person */}
          <PersonDetailModal
            open={openPersonModal}
            onClose={() => {
              setOpenPersonModal(false)
              setSelectedPerson(null)
            }}
            person={selectedPerson}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
