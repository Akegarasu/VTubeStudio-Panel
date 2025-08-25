const Card = ({ title, icon, children }) => (
  <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden h-full flex flex-col">
    <div className="p-4 bg-gray-700/50 flex items-center space-x-3">
      {icon}
      <h2 className="text-lg font-semibold text-white">{title}</h2>
    </div>
    <div className="p-4 flex-grow overflow-y-auto">{children}</div>
  </div>
);
export default Card;
