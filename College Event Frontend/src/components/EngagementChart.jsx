import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

const EngagementChart = ({ data, type = "line" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data available
      </div>
    );
  }

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
          <XAxis
            dataKey="date"
            className="text-xs text-white"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis tick={{ fill: 'currentColor' }}  className="text-white"/>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="events" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Events" />
          <Area type="monotone" dataKey="registrations" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" name="Registrations" />
          <Area type="monotone" dataKey="views" stackId="1" stroke="#EC4899" fill="#EC4899" name="Views" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
        <XAxis
          dataKey="date"
          className="text-xs text-white"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis tick={{ fill: 'currentColor' }} className="text-white"/>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="events" stroke="#3B82F6" strokeWidth={2} name="Events" />
        <Line type="monotone" dataKey="registrations" stroke="#8B5CF6" strokeWidth={2} name="Registrations" />
        <Line type="monotone" dataKey="views" stroke="#EC4899" strokeWidth={2} name="Views" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EngagementChart;
