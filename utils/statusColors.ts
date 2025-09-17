import { ProjectStatus } from '~/types/project';

export interface StatusColors {
  bg: string;
  text: string;
}

export const getStatusColor = (status: ProjectStatus): StatusColors => {
  switch (status) {
    case "Lead":
  return { bg: "#E3F2FD", text: "#1565C0" }; // blue
case "Estimate Sent":
  return { bg: "#E8EAF6", text: "#303F9F" }; // indigo, distinct from green
case "Approved":
  return { bg: "#E8F5E9", text: "#2E7D32" }; // green, clear success
case "Scheduled":
  return { bg: "#FFF9E0", text: "#F9A825" }; // gold/yellow
case "Installed":
  return { bg: "#FFF3E0", text: "#E65100" }; // orange
case "Taken Down":
  return { bg: "#ECEFF1", text: "#37474F" }; // gray
default:
  return { bg: "#F3F4F6", text: "#374151" }; // neutral slate

  }
};