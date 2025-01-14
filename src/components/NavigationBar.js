// components/Navbar.js
import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function NavigationBar() {
  return (
    <Navbar  style={{ backgroundColor: '#007FFF',  textAlign:'right' }} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard"><img
              src="/assets/imagem/logo2.png"
              alt="Logo"
              height="55"
              className="d-inline-block align-text-top"
            /></Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
          <Nav.Link as={Link} to="/DashBoard">
            Edição dos Produtos
          </Nav.Link>
            <Nav.Link as={Link} to="/slied">
            Configurar o Slied
          </Nav.Link>
          <Nav.Link as={Link} to="/key">
            Apis-key
          </Nav.Link>
          <Nav.Link as={Link} to="/lista">
            Consulta Usuários
          </Nav.Link>
          
          <Nav.Link onClick={() => window.location.reload()}>
            Sair
          </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;