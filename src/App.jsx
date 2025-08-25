import React, { useState, useEffect, useRef, useCallback } from "react";
import { Power, Zap, Smile, Tv, ChevronsRight, Unplug } from "lucide-react";
import Card from "./components/card";
import { ExpressionGroupManager } from "./components/ExpressionGroup";

// API 常量
const VTS_API_NAME = "VTubeStudioPublicAPI";
const VTS_API_VERSION = "1.0";
const PLUGIN_NAME = "VTS-Web-Console";
const PLUGIN_DEVELOPER = "akibanzu";

const GuideDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-[60%] h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10">
            <h3 className="text-xl font-bold text-white bg-gray-800/95 shadow-md px-6 pt-6 pb-4 rounded-t-lg">
              首次使用说明
            </h3>
          </div>
          <div className="space-y-6 px-6 pb-6">
            <div className="space-y-4">
              <p className="text-gray-300">
                虽然这个控制台是网页版的，但并不会传输任何数据到服务器~
                源代码已开源：
                <a
                  href="https://github.com/Akegarasu/VTubeStudio-Panel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Github Akegarasu
                </a>
              </p>
              <p className="text-gray-300">
                下面需要你进行一些操作授权才可以操控 VTS 哦！
              </p>
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-2">
                1. 打开 VTube Studio 的设置页面，开启 API：
              </p>
              <img
                src="/api_settings.webp"
                alt="VTS API Settings"
                className="rounded-lg border border-gray-600 w-[80%] mx-auto"
              />
            </div>
            <div>
              <p className="text-gray-300 font-medium mb-2">
                2. 点击"连接"后在 VTS 中授权插件：
              </p>
              <img
                src="/auth.webp"
                alt="VTS Plugin Authorization"
                className="rounded-lg border border-gray-600 w-[80%] mx-auto"
              />
            </div>
          </div>
        </div>
        <div className="p-6 bg-gray-800 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold transition-colors duration-200"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

const TopErrorToast = ({ message, onClose }) => {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (message) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);
  if (!message && !show) return null;
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        show
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-red-200 text-red-900 px-6 py-3 rounded shadow-lg flex items-center space-x-3 border border-red-300">
        <span className="font-bold">错误：</span>
        <span>{message}</span>
        <button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 px-2 py-1 bg-red-100 rounded hover:bg-red-200 text-xs text-red-700 border border-red-300"
        >
          关闭
        </button>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-gray-900 text-white p-4 shadow-lg flex items-center justify-center">
    <img
      src="/vtube_studio_logo_nyan_2.webp"
      alt="VTube Studio Logo"
      className="h-10 mr-4"
    />
    <h1 className="text-2xl font-bold">网页控制台</h1>
  </header>
);

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    disconnected: { text: "未连接", color: "bg-red-500" },
    connecting: { text: "连接中...", color: "bg-yellow-500" },
    connected: { text: "已连接, 等待授权...", color: "bg-blue-500" },
    authenticated: { text: "已授权", color: "bg-green-500" },
  };
  const { text, color } = statusConfig[status] || statusConfig.disconnected;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${color} animate-pulse`}></div>
      <span>{text}</span>
    </div>
  );
};

const ConnectionManager = ({
  status,
  connect,
  disconnect,
  wsUrl,
  setWsUrl,
}) => (
  <Card title="连接设置" icon={<Power className="text-cyan-400" />}>
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <label htmlFor="wsUrl" className="text-sm font-medium">
          API 地址:
        </label>
        <input
          id="wsUrl"
          type="text"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
          disabled={status !== "disconnected"}
        />
      </div>
      <div className="flex items-center justify-between">
        <StatusIndicator status={status} />
        {status === "disconnected" ? (
          <button
            onClick={connect}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            <Power size={18} />
            <span>连接</span>
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-semibold transition-colors duration-200 flex items-center space-x-2"
          >
            <Unplug size={18} />
            <span>断开</span>
          </button>
        )}
      </div>
      {status === "connected" && (
        <div className="text-sm text-yellow-400 p-3 bg-yellow-900/50 rounded-md">
          请在 VTube Studio 中点击 "允许" 来授权本插件。
        </div>
      )}
    </div>
  </Card>
);

const ModelManager = ({
  currentModel,
  availableModels,
  loadModel,
  isEnabled,
}) => {
  const [cooldown, setCooldown] = React.useState(false);

  // 仅在切换模型时触发冷却
  const handleChange = (e) => {
    if (cooldown) return;
    loadModel(e.target.value);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 2000);
  };

  return (
    <Card title="模型控制" icon={<Tv className="text-purple-400" />}>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-1">当前模型</h3>
          <div className="flex items-start justify-between">
            <p className="font-semibold text-lg text-purple-300 truncate flex-1">
              {isEnabled ? currentModel?.modelName || "无模型加载" : "N/A"}
            </p>
            {/* {isEnabled && currentModel && (
              <div className="text-xs text-purple-200 space-y-1 ml-4 min-w-[120px]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Mesh:</span>
                  <span>{currentModel.numberOfLive2DArtmeshes ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">参数:</span>
                  <span>{currentModel.numberOfLive2DParameters ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">贴图:</span>
                  <span>{currentModel.numberOfTextures ?? "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">分辨率:</span>
                  <span>{currentModel.textureResolution ?? "-"}</span>
                </div>
              </div>
            )} */}
          </div>
        </div>
        <div>
          <label
            htmlFor="model-select"
            className="text-sm font-medium text-gray-400 mb-1 block"
          >
            切换模型
          </label>
          <select
            id="model-select"
            onChange={handleChange}
            disabled={
              (!isEnabled || availableModels.length === 0 || cooldown) &&
              currentModel?.modelName !== ""
            }
            value={currentModel?.modelID || ""}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
          >
            {availableModels.length > 0 ? (
              availableModels.map((model) => (
                <option key={model.modelID} value={model.modelID}>
                  {model.modelName}
                </option>
              ))
            ) : (
              <option>{isEnabled ? "加载中..." : "请先连接"}</option>
            )}
          </select>
        </div>
      </div>
    </Card>
  );
};

// 表情控制组件
const ExpressionManager = ({ expressions, activateExpression, isEnabled }) => (
  <Card title="表情控制" icon={<Smile className="text-yellow-400" />}>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {isEnabled && expressions.length > 0 ? (
        expressions.map((exp) => (
          <button
            key={exp.file}
            onClick={() => activateExpression(exp.file, !exp.active)}
            className={`p-2 rounded-md text-xs truncate transition-colors duration-200 ${
              exp.active
                ? "bg-yellow-500 text-black font-bold"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {exp.name}
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-400 col-span-full">
          {isEnabled ? "没有可用的表情" : "请先连接"}
        </p>
      )}
    </div>
  </Card>
);

const HotkeyManager = ({ hotkeys, triggerHotkey, isEnabled }) => (
  <Card title="按键触发" icon={<Zap className="text-red-400" />}>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2">
      {isEnabled && hotkeys.length > 0 ? (
        hotkeys.map((hotkey) => (
          <button
            key={hotkey.hotkeyID}
            onClick={() => triggerHotkey(hotkey.hotkeyID)}
            className="p-2 rounded-md text-xs truncate bg-gray-700 hover:bg-red-500/50 transition-colors duration-200 flex items-center justify-center space-x-1"
          >
            <ChevronsRight size={14} />
            <span>{hotkey.name}</span>
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-400 col-span-full">
          {isEnabled ? "没有可用的热键" : "请先连接"}
        </p>
      )}
    </div>
  </Card>
);

function App() {
  const [wsUrl, setWsUrl] = useState(
    localStorage.getItem("vtsWsUrl") || "ws://localhost:8001"
  );
  const [status, setStatus] = useState("disconnected"); // disconnected, connecting, connected, authenticated
  const [currentModel, setCurrentModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [expressions, setExpressions] = useState([]);
  const [hotkeys, setHotkeys] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [showGuide, setShowGuide] = useState(
    !localStorage.getItem("vtsGuideShown")
  );
  const isTriggeringGroup = useRef(false);

  const ws = useRef(null);
  const requestCounter = useRef(0);

  // 页面加载后自动连接（如有token）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localStorage.getItem("vtsAuthToken")) {
        if (status === "disconnected") {
          document.activeElement &&
            document.activeElement.blur &&
            document.activeElement.blur();
          if (typeof connect === "function") connect();
        }
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- WebSocket  ---

  const sendRequest = useCallback((messageType, data = {}) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      requestCounter.current += 1;
      const request = {
        apiName: VTS_API_NAME,
        apiVersion: VTS_API_VERSION,
        requestID: `VTSWebConsole-${requestCounter.current}`,
        messageType,
        data,
      };
      ws.current.send(JSON.stringify(request));
      console.log("SENT:", request);
    } else {
      console.error("WebSocket is not connected.");
    }
  }, []);

  const fetchAllData = useCallback(() => {
    sendRequest("AvailableModelsRequest");
    sendRequest("ExpressionStateRequest", { details: false });
    sendRequest("HotkeysInCurrentModelRequest");
  }, [sendRequest]);

  const fetchCurrentModelRequest = useCallback(() => {
    sendRequest("CurrentModelRequest");
  }, [sendRequest]);

  const fetchExpressionStateRequest = useCallback(() => {
    sendRequest("ExpressionStateRequest", { details: false });
  }, [sendRequest]);

  const handleAuthentication = useCallback(() => {
    const token = localStorage.getItem("vtsAuthToken");
    if (token) {
      sendRequest("AuthenticationRequest", {
        pluginName: PLUGIN_NAME,
        pluginDeveloper: PLUGIN_DEVELOPER,
        authenticationToken: token,
      });
    } else {
      sendRequest("AuthenticationTokenRequest", {
        pluginName: PLUGIN_NAME,
        pluginDeveloper: PLUGIN_DEVELOPER,
      });
    }
  }, [sendRequest]);

  // 触发表情套组
  const triggerExpressionGroup = useCallback(
    (list) => {
      isTriggeringGroup.current = true;
      setTimeout(() => {
        isTriggeringGroup.current = false;
        fetchExpressionStateRequest();
      }, list.length * 80 + 200);

      list.forEach(({ file, active }, idx) => {
        // find in current expressions
        // const currentExp = expressions.find((e) => e.file === file);
        // const finalActivate = currentExp ? !currentExp.active : false;
        setTimeout(() => {
          sendRequest("ExpressionActivationRequest", {
            expressionFile: file,
            active: active,
          });
        }, idx * 80);
      });
    },
    [fetchExpressionStateRequest, sendRequest]
  );

  const connect = useCallback(() => {
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) return;

    setStatus("connecting");
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected.");
      setStatus("connected");
      localStorage.setItem("vtsWsUrl", wsUrl);
      handleAuthentication();
    };

    ws.current.onmessage = (event) => {
      const response = JSON.parse(event.data);
      console.log("RECEIVED:", response);

      switch (response.messageType) {
        case "APIError":
          console.error(`VTS API Error: ${response.data.message}`);
          setErrorMsg(response.data.message || "未知错误");
          if (response.data.errorID === 50) {
            // User denied auth
            localStorage.removeItem("vtsAuthToken");
            setStatus("connected"); // Back to waiting for auth
          }
          break;
        case "AuthenticationTokenResponse":
          localStorage.setItem(
            "vtsAuthToken",
            response.data.authenticationToken
          );
          handleAuthentication();
          break;
        case "AuthenticationResponse":
          if (response.data.authenticated) {
            setStatus("authenticated");
            fetchCurrentModelRequest();
          } else {
            console.error("Authentication failed.");
            localStorage.removeItem("vtsAuthToken");
            setStatus("connected");
          }
          break;
        case "ModelLoadResponse":
          setTimeout(fetchCurrentModelRequest, 500);
          break;
        case "CurrentModelResponse":
          if (!response.data.modelLoaded) {
            console.warn("No model loaded.");
            setCurrentModel(null);
            setTimeout(fetchCurrentModelRequest, 500);
            break;
          } else {
            setCurrentModel(response.data);
            console.log("Current model loaded:", response.data.modelName);
            // Fetch available models and expressions after loading current model
            setTimeout(fetchAllData, 100);
          }
          break;
        case "AvailableModelsResponse":
          setAvailableModels(response.data.availableModels);
          break;

        case "HotkeyTriggerResponse":
          console.log(`Hotkey triggered: ${response.data.hotkeyID}`);
          setTimeout(fetchExpressionStateRequest, 100);
          break;
        case "HotkeysInCurrentModelResponse":
          setHotkeys(response.data.availableHotkeys);
          break;

        case "ExpressionStateResponse":
          setExpressions(response.data.expressions);
          break;
        case "ExpressionActivationResponse":
          if (isTriggeringGroup.current) return;
          // Refresh expressions after activation
          sendRequest("ExpressionStateRequest", { details: false });
          break;
        default:
          break;
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected.");
      setStatus("disconnected");
      // Reset state
      setCurrentModel(null);
      setAvailableModels([]);
      setExpressions([]);
      setHotkeys([]);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      ws.current.close();
    };
  }, [
    wsUrl,
    handleAuthentication,
    fetchCurrentModelRequest,
    fetchExpressionStateRequest,
    isTriggeringGroup,
    sendRequest,
    fetchAllData,
  ]);

  const disconnect = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const loadModel = useCallback(
    (modelID) => {
      sendRequest("ModelLoadRequest", { modelID });
    },
    [sendRequest]
  );

  const activateExpression = useCallback(
    (expressionFile, active) => {
      sendRequest("ExpressionActivationRequest", { expressionFile, active });
    },
    [sendRequest]
  );

  const triggerHotkey = useCallback(
    (hotkeyID) => {
      sendRequest("HotkeyTriggerRequest", { hotkeyID });
    },
    [sendRequest]
  );

  // 自动断开连接
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const isEnabled = status === "authenticated";

  const handleGuideClose = useCallback(() => {
    setShowGuide(false);
    localStorage.setItem("vtsGuideShown", "true");
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <GuideDialog isOpen={showGuide} onClose={handleGuideClose} />
      <TopErrorToast message={errorMsg} onClose={() => setErrorMsg("")} />
      <Header />
      <main className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <ConnectionManager
              status={status}
              connect={connect}
              disconnect={disconnect}
              wsUrl={wsUrl}
              setWsUrl={setWsUrl}
            />
            <ModelManager
              currentModel={currentModel}
              availableModels={availableModels}
              loadModel={loadModel}
              isEnabled={isEnabled}
            />
          </div>
          <ExpressionManager
            expressions={expressions}
            activateExpression={activateExpression}
            isEnabled={isEnabled}
          />
          <HotkeyManager
            hotkeys={hotkeys}
            triggerHotkey={triggerHotkey}
            isEnabled={isEnabled}
          />
          <ExpressionGroupManager
            expressions={expressions}
            triggerGroup={triggerExpressionGroup}
            modelID={currentModel?.modelID || ""}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        <p>Made with ♥ By 秋葉aaaki</p>
      </footer>
    </div>
  );
}

export default App;
