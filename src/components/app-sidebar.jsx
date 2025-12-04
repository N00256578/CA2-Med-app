import * as React from "react";
import {
  IconConfetti,
  IconTheater,
  IconDashboard,
  IconMicrophone2,
  IconInnerShadowTop,
  IconMusic,
  IconListCheck,
  IconStethoscope,
  IconBodyScan,
  IconPillFilled,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useLocation } from "react-router";
import { useEffect } from "react";

import { NavMain } from "@/components/nav-main";
import { NavExamples } from "@/components/nav-examples";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar1Icon, HospitalIcon, User2Icon } from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: IconStethoscope,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: User2Icon,
    },
    {
      title: "Appointments",
      url: "#",
      icon: Calendar1Icon,
    },
    {
      title: "Diagnoses",
      url: "#",
      icon: IconBodyScan,
    },
    {
      title: "Prescriptions",
      url: "#",
      icon: IconPillFilled,
    },
  ],
  examples: [
    {
      name: "Forms & Validation",
      url: "/forms",
      icon: IconListCheck,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const location = useLocation();

  console.log(location);

  let message = location.state?.message;
  let type = location.state?.type;

  useEffect(() => {
    if (message) {
      if (type === "error") {
        toast.error(message);
      } else if (type === "success") {
        toast.success(message);
      } else {
        toast(message);
      }
    }
  }, [message]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              >
                <a href="#">
                  <HospitalIcon className="!size-5" />
                  <span className="text-base font-semibold">
                    Medical Clinic
                  </span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navMain} />
          <NavExamples items={data.examples} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
