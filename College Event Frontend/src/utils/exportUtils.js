import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Export analytics data to CSV
export const exportAnalyticsToCSV = (overviewStats, categoryStats, topEvents) => {
  try {
    if (!overviewStats) {
      alert("No analytics data available to export. Please create some events first.");
      return;
    }

    let csv = "College Event Management System - Analytics Report\n\n";
    csv += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Overview Statistics
    csv += "OVERVIEW STATISTICS\n";
    csv += "Metric,Value\n";
    csv += `Total Events,${overviewStats.totalEvents || 0}\n`;
    csv += `Published Events,${overviewStats.publishedEvents || 0}\n`;
    csv += `Draft Events,${overviewStats.draftEvents || 0}\n`;
    csv += `Upcoming Events,${overviewStats.upcomingEvents || 0}\n`;
    csv += `Past Events,${overviewStats.pastEvents || 0}\n`;
    csv += `Total Registrations,${overviewStats.totalRegistrations || 0}\n`;
    csv += `Total Views,${overviewStats.totalViews || 0}\n`;
    csv += `Average Attendance Rate,${overviewStats.avgAttendanceRate || 0}%\n`;
    csv += "\n";

    // Category Statistics
    csv += "CATEGORY DISTRIBUTION\n";
    csv += "Category,Event Count,Total Attendees,Total Views\n";
    if (categoryStats && categoryStats.length > 0) {
      categoryStats.forEach(cat => {
        csv += `${cat.category},${cat.count},${cat.totalAttendees},${cat.totalViews}\n`;
      });
    } else {
      csv += "No category data available\n";
    }
    csv += "\n";

    // Top Events
    csv += "TOP PERFORMING EVENTS\n";
    csv += "Rank,Title,Category,Date,Attendees,Views\n";
    if (topEvents && topEvents.length > 0) {
      topEvents.forEach((event, index) => {
        csv += `${index + 1},${event.title},${event.category},${new Date(event.date).toLocaleDateString()},${event.attendees},${event.views}\n`;
      });
    } else {
      csv += "No events data available\n";
    }

    // Create and download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert("CSV report downloaded successfully!");
  } catch (error) {
    console.error("CSV export error:", error);
    alert("Failed to export CSV. Please check the console for details.");
  }
};

// Export analytics data to PDF
export const exportAnalyticsToPDF = (overviewStats, categoryStats, topEvents) => {
  try {
    if (!overviewStats) {
      alert("No analytics data available to export. Please create some events first.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246); // Blue color
  doc.text("College Event Management System", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Analytics Report", pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 38, { align: "center" });

  // Overview Statistics
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Overview Statistics", 14, 50);

  const overviewData = [
    ["Total Events", overviewStats.totalEvents || 0],
    ["Published Events", overviewStats.publishedEvents || 0],
    ["Draft Events", overviewStats.draftEvents || 0],
    ["Upcoming Events", overviewStats.upcomingEvents || 0],
    ["Past Events", overviewStats.pastEvents || 0],
    ["Total Registrations", overviewStats.totalRegistrations || 0],
    ["Total Views", overviewStats.totalViews || 0],
    ["Average Attendance Rate", `${overviewStats.avgAttendanceRate || 0}%`]
  ];

  autoTable(doc, {
    startY: 55,
    head: [["Metric", "Value"]],
    body: overviewData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  // Category Distribution
  let yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text("Category Distribution", 14, yPos);

  const categoryData = (categoryStats && categoryStats.length > 0)
    ? categoryStats.map(cat => [
        cat.category,
        cat.count,
        cat.totalAttendees,
        cat.totalViews
      ])
    : [["No data", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Category", "Events", "Attendees", "Views"]],
    body: categoryData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 }
  });

  // Top Performing Events
  yPos = doc.lastAutoTable.finalY + 15;

  // Check if we need a new page
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text("Top Performing Events", 14, yPos);

  const topEventsData = (topEvents && topEvents.length > 0)
    ? topEvents.map((event, index) => [
        `#${index + 1}`,
        event.title,
        event.category,
        new Date(event.date).toLocaleDateString(),
        event.attendees,
        event.views
      ])
    : [["No data", "-", "-", "-", "-", "-"]];

  autoTable(doc, {
    startY: yPos + 5,
    head: [["Rank", "Title", "Category", "Date", "Attendees", "Views"]],
    body: topEventsData,
    theme: "grid",
    headStyles: { fillColor: [236, 72, 153] },
    margin: { left: 14, right: 14 }
  });

  // Most Popular Event Highlight (if exists)
  if (overviewStats.mostPopularEvent) {
    yPos = doc.lastAutoTable.finalY + 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text("Most Popular Event", 14, yPos);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPos += 8;
    doc.text(`Title: ${overviewStats.mostPopularEvent.title}`, 14, yPos);
    yPos += 6;
    doc.text(`Attendees: ${overviewStats.mostPopularEvent.attendees} | Views: ${overviewStats.mostPopularEvent.views}`, 14, yPos);
  }

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    alert("PDF report downloaded successfully!");
  } catch (error) {
    console.error("PDF export error:", error);
    alert("Failed to export PDF. Error: " + error.message);
  }
};

// Export attendance data to PDF
export const exportAttendanceToPDF = (attendance, eventTitle) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("Event Attendance Report", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(eventTitle || attendance.eventTitle, pageWidth / 2, 30, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Event Date: ${new Date(attendance.eventDate).toLocaleDateString()}`, pageWidth / 2, 38, { align: "center" });
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 44, { align: "center" });

  // Summary
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Summary", 14, 55);

  const summaryData = [
    ["Total Attendees", attendance.totalAttendees],
    ["Capacity", attendance.capacity || "Unlimited"],
    ["Capacity Utilization", attendance.capacityUtilization ? `${attendance.capacityUtilization}%` : "N/A"]
  ];

  autoTable(doc, {
    startY: 60,
    head: [["Metric", "Value"]],
    body: summaryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 }
  });

  // Attendees List
  let yPos = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.text("Attendees List", 14, yPos);

  const attendeesData = attendance.attendees.map((attendee, index) => [
    index + 1,
    attendee.name,
    attendee.email,
    attendee.department,
    attendee.year
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [["#", "Name", "Email", "Department", "Year"]],
    body: attendeesData,
    theme: "grid",
    headStyles: { fillColor: [139, 92, 246] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`${eventTitle || "event"}-attendance-${new Date().toISOString().split('T')[0]}.pdf`);
};
