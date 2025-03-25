import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Profile from './Profile';
import Loading from '../components/Loading';

function MyProfile() {
  const { auth, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />;
  }

  if (!auth.user) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Необходимо авторизоваться для просмотра профиля</p>
      </div>
    );
  }

  return <Profile currentUser={true} />;
}

export default MyProfile;