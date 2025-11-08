import React, { useState, useEffect } from "react";
import { fetchEventAttendance } from "../api";
import { FaUsers, FaChartPie, FaDownload, FaSearch, FaFilePdf } from "react-icons/fa";
import { exportAttendanceToPDF } from "../utils/exportUtils";

const AttendanceTracker = ({ eventId, eventTitle }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  useEffect(() => {
    loadAttendance();
  }, [eventId]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await fetchEventAttendance(eventId);
      setAttendance(data);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!attendance || !attendance.attendees) return;

    const headers = ["Name", "Email", "Department", "Year"];
    const rows = attendance.attendees.map(attendee => [
      attendee.name,
      attendee.email,
      attendee.department,
      attendee.year
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventTitle || "event"}-attendance.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFilteredAttendees = () => {
    if (!attendance || !attendance.attendees) return [];

    return attendance.attendees.filter(attendee => {
      const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = filterDepartment === "all" || attendee.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });
  };

  const getDepartments = () => {
    if (!attendance || !attendance.attendees) return [];
    const depts = [...new Set(attendance.attendees.map(a => a.department))];
    return depts.filter(d => d !== "N/A");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600 dark:text-gray-300">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  if (!attendance) return null;

  const filteredAttendees = getFilteredAttendees();
  const departments = getDepartments();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Attendees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendance.totalAttendees}</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
              <FaUsers className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Capacity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {attendance.capacity || "Unlimited"}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
              <FaChartPie className="text-2xl" />
            </div>
          </div>
        </div>

        {attendance.capacityUtilization !== null && (
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Capacity Utilization</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendance.capacityUtilization}%
                </p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                <FaChartPie className="text-2xl" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters and Export */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          {departments.length > 0 && (
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          )}

          {/* Export Buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaDownload /> CSV
          </button>
          <button
            onClick={() => exportAttendanceToPDF(attendance, eventTitle)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaFilePdf /> PDF
          </button>
        </div>

        {/* Attendees List */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Year</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((attendee, index) => (
                  <tr key={attendee.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{index + 1}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{attendee.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{attendee.email}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{attendee.department}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{attendee.year}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No attendees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredAttendees.length} of {attendance.totalAttendees} attendees
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
