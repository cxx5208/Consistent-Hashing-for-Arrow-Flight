"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

const navItems = [
  { name: "User", route: "/user" },
  { name: "Admin", route: "/admin" },
];

export default function DrawerAppBar({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  function navigateToPage(item: any) {
    router.push(item.route);
  }

  return (
    <Box>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { sm: "block" } }}
          >
            Cloud Storage
          </Typography>
          <Box sx={{ display: { sm: "block" } }}>
            {navItems.map((item) => (
              <Button
                onClick={() => navigateToPage(item)}
                key={item.name}
                sx={{ color: "#fff" }}
              >
                {item.name}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main">
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
