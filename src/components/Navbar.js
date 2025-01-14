import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <div className="container-fluid">
      <Link to="/" className="navbar-brand">
        Loja
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/products">Produtos</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/cart">Meu Carrinho</Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
);

export default Navbar;