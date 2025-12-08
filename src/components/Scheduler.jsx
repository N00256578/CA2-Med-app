import { DayPilotScheduler, DayPilot } from "@daypilot/daypilot-lite-react";

const Scheduler = () => {
  const config = {
    timeHeaders: [{ groupBy: "Month" }, { groupBy: "Day", format: "d" }],
    scale: "Day",
    days: 30,
    startDate: new Date().toISOString().split('T')[0], // Today's date
    cellDuration: 1440, // 1440 minutes = 1 day
    cellWidth: 50,
    resources: [
      { name: "Doctor 1", id: "doc1" },
      { name: "Doctor 2", id: "doc2" },
      { name: "Doctor 3", id: "doc3" },
    ],
    events: [
      {
        id: 1,
        text: "Appointment 1",
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(), // +1 hour
        resource: "doc1"
      }
    ]
  };

  return (
    <div style={{ height: "500px" }}>
      <DayPilotScheduler {...config} />
    </div>
  );
};

export default Scheduler;
