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
import "./FamilyTree.css";

const nodeTypes = { person: PersonNode };

export default function FamilyTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingEdge, setPendingEdge] = useState(null); // edge đang chờ nhập label
  const [openModal, setOpenModal] = useState(false);

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
          type: "step", // 👈 luôn đi ngang/dọc theo handle
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

  // Add person
  const handleAddPerson = async (name) => {
    try {
      const res = await api.post("/persons", { name, position_x: 200, position_y: 200 });
      const p = res.data;
      const newNode = {
        id: p.id.toString(),
        type: "person",
        position: { x: p.position_x ?? 200, y: p.position_y ?? 200 },
        data: { person: p, onDelete: handleDeletePerson },
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

  // Khi nối node → mở modal để nhập label
  const onConnect = useCallback((params) => {
    setPendingEdge(params);
    setOpenModal(true);
  }, []);

  // Lưu quan hệ sau khi nhập label
  const handleSaveRelation = async (label) => {
    try {
      const payload = {
        source_id: pendingEdge.source,
        target_id: pendingEdge.target,
        label,
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
            type: "step", // 👈 ép kiểu edge ngang/dọc
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

  return (
    <div className="app-container" style={{ display: "flex", height: "100%" }}>
      <div className="sidebar">
        <Sidebar onAddPerson={handleAddPerson} />
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
            defaultEdgeOptions={{ type: "step", animated: true }} // 👈 thay đổi ở đây
          >
            <Background />
            <Controls />
          </ReactFlow>

          {/* Modal nhập quan hệ */}
          <RelationModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            onSave={handleSaveRelation}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
