// import React from "react"
// import { getBezierPath } from "reactflow"

// export default function CustomEdge({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   label,
//   note,
// }) {
//   const [edgePath, labelX, labelY] = getBezierPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//   })

//   return (
//     <>
//       {/* --- Đường nối --- */}
//       <path
//         id={id}
//         d={edgePath}
//         stroke="#999"
//         strokeWidth={1.5}
//         fill="none"
//         strokeDasharray="4 2"
//       />

//       {/* --- Ghi chú nhỏ phía trên --- */}
//       {note && (
//         <text
//           x={labelX}
//           y={labelY - 10}
//           textAnchor="middle"
//           style={{
//             fontSize: 10,
//             fill: "#777",
//             fontStyle: "italic",
//             pointerEvents: "none",
//           }}
//         >
//           {note}
//         </text>
//       )}

//       {/* --- Nhãn chính --- */}
//       {label && (
//         <text
//           x={labelX}
//           y={labelY + 2}
//           textAnchor="middle"
//           style={{
//             fontSize: 12,
//             fontWeight: 600,
//             fill: label.includes("Ly hôn") ? "red" : "#333",
//             pointerEvents: "none",
//           }}
//         >
//           {label}
//         </text>
//       )}
//     </>
//   )
// }
