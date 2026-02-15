import { useSelector } from 'react-redux'
import StudentDashboard from './dashboards/StudentDashboard'
import FacultyDashboard from './dashboards/FacultyDashboard'
import AuthorityDashboard from './dashboards/AuthorityDashboard'
import AdminDashboard from './dashboards/AdminDashboard'

const Dashboard = () => {
  const { user } = useSelector(state => state.auth)

  switch (user?.role) {
    case 'student':
      return <StudentDashboard />
    case 'faculty':
      return <FacultyDashboard />
    case 'authority':
      return <AuthorityDashboard />
    case 'admin':
      return <AdminDashboard />
    default:
      return <div>Unauthorized</div>
  }
}

export default Dashboard
