import React from 'react';
import Image from 'next/image';

interface ProfileCardProps {
  profile: {
    name?: string;
    display_name?: string;
    picture?: string;
    banner?: string;
    about?: string;
    website?: string;
    nip05?: string;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md mx-auto">
      {profile.banner && (
        <div className="h-32 w-full relative">
          <Image
            src={profile.banner}
            alt="Profile banner"
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg -mt-10 relative overflow-hidden">
            <Image
              src={profile.picture || '/fallback-avatar.svg'}
              alt={profile.name || profile.display_name || "Profile picture"}
              layout="fill"
              objectFit="cover"
              onError={(e) => {
                e.currentTarget.src = '/fallback-avatar.svg';
              }}
            />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-800">{profile.display_name || profile.name}</h2>
            {profile.name && profile.name !== profile.display_name && (
              <p className="text-gray-600">@{profile.name}</p>
            )}
          </div>
        </div>
        {profile.about && (
          <p className="mt-4 text-gray-700 leading-relaxed">{profile.about}</p>
        )}
        <div className="mt-4 space-y-2">
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
              Website
            </a>
          )}
          {profile.nip05 && (
            <p className="text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {profile.nip05}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;