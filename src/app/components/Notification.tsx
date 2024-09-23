/* eslint-disable @next/next/no-img-element */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "@/context/NotificationProvider";

function getNotificationStyle(type: string) {
  switch (type) {
    case "success":
      return { backgroundColor: "#80ffba", color: "#08331a" };
    case "error":
      return {
        backgroundColor: "rgba(255, 128, 128, 1)",
        color: "rgba(51, 6, 8, 1)",
      };
    case "info":
      return { backgroundColor: "#85fff9", color: "#002922" };
    default:
      return { backgroundColor: "#ffe180", color: "#332008" };
  }
}

function getNotificationIcon(type: string) {
  let iconPath: string;
  let bgColor: string;
  let iconColor: string;

  switch (type) {
    case "success":
      iconPath = "/svg/checkmark-circle.svg";
      bgColor = "bg-green-800";
      iconColor = "text-green-800";
      break;
    case "error":
      iconPath = "/svg/clear-circle.svg";
      bgColor = "bg-red-500";
      iconColor = "text-red-600";
      break;
    case "info":
      iconPath = "/svg/info-circle.svg";
      bgColor = "bg-cyan-600";
      iconColor = "text-cyan-600";
      break;
    default:
      iconPath = "/svg/warning-circle.svg";
      bgColor = "bg-yellow-800";
      iconColor = "text-yellow-800";
  }

  return (
    <div className={`rounded-full ${bgColor}`}>
      <div className={`w-5 h-5 ${iconColor} flex items-center justify-center`}>
        <img src={iconPath} alt={type} className="w-4 h-4" />
      </div>
    </div>
  );
}

const Notification: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-8 z-50 flex flex-col gap-2 item-center">
      <AnimatePresence initial={false}>
        {notifications.map((notification) => {
          const style = getNotificationStyle(notification.type);
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={style}
              className="px-3 py-2 text-xs gap-2 flex items-center rounded-lg shadow-lg w-64"
              layout
              onClick={() => removeNotification(notification.id)}
            >
              <div className="flex items-center justify-center">
                {getNotificationIcon(notification.type)}
              </div>
              <p className="text-wrap break-all">
                {notification.message.map((msg, i) => (
                  <React.Fragment key={i}>
                    {i === 0 ? "" : " "}
                    {msg}
                  </React.Fragment>
                ))}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
