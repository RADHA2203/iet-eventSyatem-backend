import { FaTrophy, FaEye, FaCalendar, FaUsers, FaChartLine, FaCheckCircle } from "react-icons/fa";

const StatisticsCard = ({ title, value, icon, trend, color = "blue" }) => {
  const getIcon = () => {
    switch (icon) {
      case "trophy":
        return <FaTrophy className="text-2xl" />;
      case "eye":
        return <FaEye className="text-2xl" />;
      case "calendar":
        return <FaCalendar className="text-2xl" />;
      case "users":
        return <FaUsers className="text-2xl" />;
      case "chart":
        return <FaChartLine className="text-2xl" />;
      case "check":
        return <FaCheckCircle className="text-2xl" />;
      default:
        return <FaChartLine className="text-2xl" />;
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
      pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400",
      red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
              {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${getColorClasses()}`}>
          {getIcon()}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
