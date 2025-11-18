import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const CategoryChart = ({ data, type = "bar" }) => {
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, count }) => `${category}: ${count}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
        <XAxis
          dataKey="category"
          className="text-xs text-white"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          tick={{ fill: 'currentColor' }} className="text-white"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Bar dataKey="count" fill="#3B82F6" name="Events" />
        <Bar dataKey="totalAttendees" fill="#8B5CF6" name="Attendees" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
