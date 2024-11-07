import { Container } from "@mantine/core"
import { Outlet } from "react-router-dom"
import { Nav } from "../components/simple-nav"

export function Root() {
  return (
    <Container fluid size="xl">
      <Nav />
      <Outlet />
    </Container>
  )
}
