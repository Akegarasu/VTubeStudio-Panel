import React, { useState, useEffect, useRef, useCallback } from "react";
import { Power, Zap, Smile, Tv, ChevronsRight, Unplug } from "lucide-react";
import Card from "./card";

const ExpressionGroupDialog = ({
  open,
  onClose,
  onSave,
  expressions,
  initial,
}) => {
  const [name, setName] = React.useState(initial?.name || "");
  const [touched, setTouched] = React.useState(false);
  const [selected, setSelected] = React.useState(initial?.list || []);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || "");
      setSelected(initial?.list || []);
    }
  }, [open, initial]);

  // 支持取消选中
  const toggle = (file, active, checked) => {
    setSelected((prev) => {
      const idx = prev.findIndex((e) => e.file === file);
      if (checked) {
        // 选中则添加或更新
        if (idx >= 0) {
          const arr = [...prev];
          arr[idx] = { file, active };
          return arr;
        }
        return [...prev, { file, active }];
      } else {
        // 取消则移除
        if (idx >= 0) {
          const arr = [...prev];
          arr.splice(idx, 1);
          return arr;
        }
        return prev;
      }
    });
  };

  return open ? (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-[90vw] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-4 text-white">
          {initial ? "编辑" : "新建"}表情套组
        </h3>
        <div className="mb-3">
          <input
            className={
              `w-full px-3 py-2 rounded bg-gray-900 border text-white ` +
              (!name ? 'border-red-500 placeholder-red-400' : 'border-gray-600')
            }
            placeholder="套组名称"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(true)}
          />
          {!name && (
            <div className="text-xs text-red-400 mt-1">请输入套组名称</div>
          )}
        </div>
        <div className="mb-4 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {expressions.map((exp) => {
              const sel = selected.find((e) => e.file === exp.file);
              return (
                <div
                  key={exp.file}
                  className="flex items-center space-x-2 bg-gray-700 rounded p-2"
                >
                  <input
                    type="checkbox"
                    checked={!!sel}
                    onChange={e => toggle(exp.file, sel ? sel.active : true, e.target.checked)}
                  />
                  <span className="flex-1 text-xs truncate">{exp.name}</span>
                  {!!sel && (
                    <select
                      className="bg-gray-900 border border-gray-600 rounded text-xs px-1 py-0.5"
                      value={sel.active ? "on" : "off"}
                      onChange={e => toggle(exp.file, e.target.value === "on", true)}
                    >
                      <option value="on">激活</option>
                      <option value="off">关闭</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            className="px-3 py-1 rounded bg-gray-600 text-white"
            onClick={onClose}
          >
            取消
          </button>
          <button
            className="px-3 py-1 rounded bg-purple-600 text-white font-bold"
            disabled={!name || selected.length === 0}
            onClick={() => {
              onSave({ name, list: selected });
              onClose();
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
// 表情套组Card
const ExpressionGroupManager = ({ expressions, triggerGroup, modelID }) => {
  // 以modelID为key存储
  const storageKey = modelID ? `vtsExpressionGroups_${modelID}` : "vtsExpressionGroups";
  const [groups, setGroups] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editIdx, setEditIdx] = React.useState(-1);

  const openNew = () => {
    setEditIdx(-1);
    setDialogOpen(true);
  };
  const openEdit = (idx) => {
    setEditIdx(idx);
    setDialogOpen(true);
  };
  const closeDialog = () => setDialogOpen(false);

  const saveGroup = (group) => {
    let newGroups;
    if (editIdx >= 0) {
      newGroups = groups.map((g, i) => (i === editIdx ? group : g));
    } else {
      newGroups = [...groups, group];
    }
    setGroups(newGroups);
    localStorage.setItem(storageKey, JSON.stringify(newGroups));
  };
  const deleteGroup = (idx) => {
    const newGroups = groups.filter((_, i) => i !== idx);
    setGroups(newGroups);
    localStorage.setItem(storageKey, JSON.stringify(newGroups));
  };

  // 切换模型时自动加载对应分组
  useEffect(() => {
    try {
      setGroups(JSON.parse(localStorage.getItem(storageKey) || "[]"));
    } catch {
      setGroups([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // 右键菜单
  const [menuIdx, setMenuIdx] = React.useState(-1);
  const [menuPos, setMenuPos] = React.useState({ x: 0, y: 0 });
  const handleContextMenu = (e, idx) => {
    e.preventDefault();
    setMenuIdx(idx);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };
  const closeMenu = () => setMenuIdx(-1);

  return (
    <div className="col-span-2">
      <Card title="表情套组" icon={<Smile className="text-pink-400" />}> 
        <div className="flex flex-wrap gap-2 mb-3">
        {groups.map((g, i) => (
          <button
            key={i}
            className="px-3 py-1 rounded bg-gray-700 hover:bg-pink-400/40 text-xs font-bold text-white transition-colors relative"
            onClick={() => triggerGroup(g.list)}
            onContextMenu={(e) => handleContextMenu(e, i)}
          >
            {g.name}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-pink-400/40 hover:bg-pink-500/80 text-pink-300 text-xs font-bold"
          onClick={openNew}
        >
          ＋
        </button>
      </div>
      <ExpressionGroupDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={saveGroup}
        expressions={expressions}
        initial={editIdx >= 0 ? groups[editIdx] : undefined}
      />
      {/* 右键菜单 */}
      {menuIdx >= 0 && (
        <div
          style={{
            position: "fixed",
            left: menuPos.x,
            top: menuPos.y,
            zIndex: 1000,
          }}
          className="bg-gray-800 border border-gray-600 rounded shadow-lg"
        >
          <button
            className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-700"
            onClick={() => {
              openEdit(menuIdx);
              closeMenu();
            }}
          >
            编辑
          </button>
          <button
            className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700"
            onClick={() => {
              deleteGroup(menuIdx);
              closeMenu();
            }}
          >
            删除
          </button>
        </div>
      )}
      {menuIdx >= 0 && (
        <div className="fixed inset-0 z-0" onClick={closeMenu}></div>
      )}
      </Card>
    </div>
  );
};

export {
  ExpressionGroupManager, ExpressionGroupDialog
}