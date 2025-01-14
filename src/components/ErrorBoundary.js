import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para exibir a interface de erro
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Você também pode registrar o erro em um serviço de log
    console.log("Erro capturado:", error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Ocorreu um erro. Tente novamente mais tarde.</h2>
          {/* Você pode exibir detalhes sobre o erro, se desejar */}
          {/* <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.info.componentStack}
          </details> */}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;