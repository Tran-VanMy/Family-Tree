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

  // ✅ state cho branch families
  const [families, setFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState(
    () => localStorage.getItem("ft_family") || null
  );

  const navigate = useNavigate();

  // If no user -> redirect to login
  useEffect(() => {
    const userStr = localStorage.getItem("ft_user");
    if (!userStr) navigate("/login");
  }, [navigate]);

  // ✅ Load danh sách families cho user
  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const res = await api.get("/families");
        const list = res.data || [];
        setFamilies(list);

        // nếu chưa có selectedFamilyId hoặc id không còn tồn tại -> chọn cái đầu tiên
        if (list.length > 0) {
          const exist = list.find(
            (f) => String(f.family_id) === String(selectedFamilyId)
          );
          const firstId = exist ? exist.family_id : list[0].family_id;
          setSelectedFamilyId(String(firstId));
          localStorage.setItem("ft_family", String(firstId));
        } else {
          setSelectedFamilyId(null);
          localStorage.removeItem("ft_family");
        }
      } catch (err) {
        console.error("Error loading families", err);
      }
    };

    fetchFamilies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Load persons + relations mỗi khi đổi nhánh
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedFamilyId) {
        setNodes([]);
        setEdges([]);
        return;
      }

      try {
        // đảm bảo header interceptor đọc ft_family mới
        localStorage.setItem("ft_family", String(selectedFamilyId));

        const [personsRes, marriagesRes, parentChildRes, relationsRes] =
          await Promise.all([
            api.get("/persons"),
            api.get("/marriages"),
            api.get("/parent-child"),
            api.get("/relations"),
          ]);

        // normalize persons: backend returns person_id; map to id for frontend convenience
        const fetchedNodes = (personsRes.data || []).map((p) => {
          const id = String(p.person_id ?? p.id);
          return {
            id,
            type: "person",
            position: {
              x:
                typeof p.position_x === "number"
                  ? p.position_x
                  : Math.random() * 400,
              y:
                typeof p.position_y === "number"
                  ? p.position_y
                  : Math.random() * 400,
            },
            data: {
              person: { ...p, id },
              onDelete: handleDeletePerson,
            },
          };
        });

        // marriages -> edges (spouse relations)
        const marriageEdges = (marriagesRes.data || []).map((m) => ({
          id: `m-${m.marriage_id}`,
          source: String(m.spouse1_id),
          target: String(m.spouse2_id),
          label: m.note || (m.status ?? "Kết hôn"),
          type: "step",
        }));

        // parent_child -> edges (cha mẹ - con)
        const pcEdges = (parentChildRes.data || []).map((pc) => ({
          id: `pc-${pc.parent_child_id}`,
          source: String(pc.parent_id),
          target: String(pc.child_id),
          label: pc.relationship || "",
          type: "step",
        }));

        // ✅ relations -> edges (anh em, họ hàng, anh kế, ...)
        const relationEdges = (relationsRes.data || []).map((r) => ({
          id: `r-${r.relation_id}`,
          source: String(r.person1_id),
          target: String(r.person2_id),
          label: r.relationship || "",
          type: "step",
        }));

        // set nodes & edges
        setNodes(
          fetchedNodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              onOpen: () => {
                // lấy person mới nhất từ state
                setSelectedPerson(node.data.person);
                setOpenPersonModal(true);
              },
            },
          }))
        );

        setEdges([...marriageEdges, ...pcEdges, ...relationEdges]);
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFamilyId]);

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
      const id = String(p.person_id ?? p.id);
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
        setEdges((eds) =>
          eds.filter(
            (e) => e.source !== String(id) && e.target !== String(id)
          )
        );
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

  // ✅ Lưu quan hệ (marriage / parent_child / relations)
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

        const newEdge = {
          id: `m-${created.marriage_id}`,
          source: String(created.spouse1_id),
          target: String(created.spouse2_id),
          label: created.status,
          type: "step",
        };

        // ✅ Xóa edge cũ giữa 2 node rồi addEdge -> label cập nhật ngay
        setEdges((eds) => {
          const filtered = eds.filter(
            (e) =>
              !(
                e.source === String(source) &&
                e.target === String(target)
              )
          );
          return addEdge(newEdge, filtered);
        });
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

        const newEdge = {
          id: `pc-${created.parent_child_id}`,
          source: String(created.parent_id),
          target: String(created.child_id),
          label: created.relationship,
          type: "step",
        };

        setEdges((eds) => {
          const filtered = eds.filter(
            (e) =>
              !(
                e.source === String(source) &&
                e.target === String(target)
              )
          );
          return addEdge(newEdge, filtered);
        });
      }

      // 🧩 Các loại khác: anh/chị/em, anh kế, họ hàng… -> bảng relations
      else {
        const res = await api.post("/relations", {
          person1_id: Number(source),
          person2_id: Number(target),
          relationship:
            relation.relationship?.trim() ||
            relation.label?.trim() ||
            "Quan hệ",
        });

        created = res.data;

        const newEdge = {
          id: `r-${created.relation_id}`,
          source: String(created.person1_id),
          target: String(created.person2_id),
          label: created.relationship,
          type: "step",
        };

        setEdges((eds) => {
          const filtered = eds.filter(
            (e) =>
              !(
                e.source === String(source) &&
                e.target === String(target)
              )
          );
          return addEdge(newEdge, filtered);
        });
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
          nds.map((n) =>
            n.id === node.id ? { ...n, position: node.position } : n
          )
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
      const updated = {
        ...updatedRaw,
        id: String(updatedRaw.person_id ?? updatedRaw.id),
      };

      setNodes((nds) =>
        nds.map((n) =>
          n.id === String(id)
            ? { ...n, data: { ...n.data, person: updated } }
            : n
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
    localStorage.removeItem("ft_user");
    localStorage.removeItem("ft_family");
    localStorage.removeItem("ft_tree");
    navigate("/login");
  };

  // ✅ handlers cho branch families
  const handleSelectFamily = (familyId) => {
    setSelectedFamilyId(String(familyId));
    localStorage.setItem("ft_family", String(familyId));
  };

  const handleCreateFamily = async (name) => {
    const res = await api.post("/families", {
      name,
      description: "",
    });
    const fam = res.data;
    setFamilies((fs) => [...fs, fam]);
    setSelectedFamilyId(String(fam.family_id));
    localStorage.setItem("ft_family", String(fam.family_id));
  };

  const handleRenameFamily = async (id, newName) => {
    const res = await api.patch(`/families/${id}`, {
      name: newName,
    });
    const updated = res.data;
    setFamilies((fs) =>
      fs.map((f) => (f.family_id === id ? updated : f))
    );
  };

  const handleDeleteFamily = async (id) => {
    await api.delete(`/families/${id}`);
    setFamilies((fs) => fs.filter((f) => f.family_id !== id));

    if (String(selectedFamilyId) === String(id)) {
      // chọn nhánh khác nếu còn
      const remaining = families.filter((f) => f.family_id !== id);
      if (remaining.length > 0) {
        const newId = remaining[0].family_id;
        setSelectedFamilyId(String(newId));
        localStorage.setItem("ft_family", String(newId));
      } else {
        setSelectedFamilyId(null);
        localStorage.removeItem("ft_family");
        setNodes([]);
        setEdges([]);
      }
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar
          onAddPerson={handleAddPerson}
          persons={personsList}
          onDeletePerson={handleDeletePerson}
          onOpenPerson={(p) => {
            setSelectedPerson(p);
            setOpenPersonModal(true);
          }}
          families={families}
          selectedFamilyId={selectedFamilyId}
          onSelectFamily={handleSelectFamily}
          onCreateFamily={handleCreateFamily}
          onRenameFamily={handleRenameFamily}
          onDeleteFamily={handleDeleteFamily}
        />
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
              setOpenModal(false);
              setPendingEdge(null);
            }}
            onSave={handleSaveRelation}
          />

          <PersonDetailModal
            open={openPersonModal}
            onClose={() => {
              setOpenPersonModal(false);
              setSelectedPerson(null);
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
            setSelectedPerson(p);
            setOpenPersonModal(true);
          }}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
