import { useEffect, useState } from "react";
import { Clock, Timer } from "lucide-react";

interface CountdownTimerProps {
  startDate: string;
  endDate: string;
  status: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const getTimeLeft = (target: string): TimeLeft => {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    total: diff,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const CountdownTimer = ({ startDate, endDate, status }: CountdownTimerProps) => {
  const isUpcoming = status === "upcoming";
  const targetDate = isUpcoming ? startDate : endDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));

  useEffect(() => {
    if (status === "completed") return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate, status]);

  if (status === "completed") {
    return (
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Ended {new Date(endDate).toLocaleDateString()}</span>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;
  const label = isUpcoming ? "Starts in" : "Ends in";

  // Compact: show only most significant unit(s)
  const display =
    days > 0
      ? `${days}d ${hours}h`
      : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

  const isUrgent = !isUpcoming && days === 0 && hours < 6;

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${
      isUrgent
        ? "text-destructive"
        : isUpcoming
        ? "text-warning"
        : "text-success"
    }`}>
      <Timer className={`w-3 h-3 ${isUrgent ? "animate-pulse" : ""}`} />
      <span>{label} <span className="font-extrabold">{display}</span></span>
    </div>
  );
};

export default CountdownTimer;
