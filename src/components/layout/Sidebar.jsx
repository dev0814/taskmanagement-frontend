import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaTasks, FaUsers, FaPlus, FaUserCircle, FaListUl } from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user.role === 'admin';

  return (
    <aside className="hidden md:block w-64 bg-gray-800 text-white p-4">
      <nav className="mt-5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center p-3 mb-2 rounded-md ${
              isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`
          }
        >
          <FaTachometerAlt className="mr-3" />
          <span>Dashboard</span>
        </NavLink>

        {/* Tasks section - visible to all users */}
        <div className="mb-4">
          <div className="px-3 mb-2 text-xs uppercase tracking-wide text-gray-400">
            Tasks
          </div>
          
          {isAdmin ? (
            <>
              {/* Admin task links */}
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex items-center p-3 mb-2 rounded-md ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                <FaTasks className="mr-3" />
                <span>All Tasks</span>
              </NavLink>
              <NavLink
                to="/tasks/create"
                className={({ isActive }) =>
                  `flex items-center p-3 mb-2 rounded-md ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                <FaPlus className="mr-3" />
                <span>Create Task</span>
              </NavLink>
            </>
          ) : (
            <>
              {/* Regular user task links */}
              <NavLink
                to="/my-tasks"
                className={({ isActive }) =>
                  `flex items-center p-3 mb-2 rounded-md ${
                    isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`
                }
              >
                <FaListUl className="mr-3" />
                <span>My Tasks</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Profile section for all users */}
        <div className="mb-4">
          <div className="px-3 mb-2 text-xs uppercase tracking-wide text-gray-400">
            Profile
          </div>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center p-3 mb-2 rounded-md ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`
            }
          >
            <FaUserCircle className="mr-3" />
            <span>My Profile</span>
          </NavLink>
        </div>

        {/* Admin only section */}
        {isAdmin && (
          <div className="mb-4">
            <div className="px-3 mb-2 text-xs uppercase tracking-wide text-gray-400">
              User Management
            </div>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center p-3 mb-2 rounded-md ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`
              }
            >
              <FaUsers className="mr-3" />
              <span>Users</span>
            </NavLink>
            <NavLink
              to="/users/create"
              className={({ isActive }) =>
                `flex items-center p-3 mb-2 rounded-md ${
                  isActive ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`
              }
            >
              <FaPlus className="mr-3" />
              <span>Create User</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar; 