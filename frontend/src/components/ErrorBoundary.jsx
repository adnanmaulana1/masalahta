import { Component } from 'react'
import ServerError from '../pages/ServerError'

export default class ErrorBoundary extends Component {
  state = { crashed: false }

  static getDerivedStateFromError() {
    return { crashed: true }
  }

  render() {
    if (this.state.crashed) {
      return <ServerError onRetry={() => { this.setState({ crashed: false }); window.location.reload() }} />
    }
    return this.props.children
  }
}
