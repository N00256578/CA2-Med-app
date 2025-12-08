import { useLocation } from "react-router";
import { Link } from "react-router";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items }) {
  let location = useLocation();

  const checkActive = (url) => {
    if (location.pathname === "/" && url === "/") {
      console.log("You are in dashboard");
      return true;
    } else if (url !== "/" && location.pathname.includes(url)) {
      console.log("You are somwhere else");
      return true;
    }

    return false;
  };

  // console.log(location);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={checkActive(item.url)}
              >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
