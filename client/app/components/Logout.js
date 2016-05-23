import React from 'react'
import { Link } from 'react-router'

const Logout = React.createClass({

  componentDidMount() {
    this.props.logout()
    this.props.goto('/')
  },

  render() {
    //Ideally this will never be displayed
    return (
      <section className="column is-offset-6 is-6">
        <p>You are now logged out. Click <Link to="/">here</Link> to log back in.</p>
      </section>
    )
  },
})

export default Logout
