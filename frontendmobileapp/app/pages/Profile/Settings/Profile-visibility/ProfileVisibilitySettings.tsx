import ProfileVisibility from './ProfileVisibility';
import { useAppSelector } from '@/app/store/hooks';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react'

const ProfileVisibilitySettings = () => {
    const TotalProfileVisibilitySettings = 8;  // Total number of profile visibility settings
    const profileSettings = useAppSelector(state => state.profile.settings.profileVisibilitySettings);
    const initialVisibilityValues = Array.from({ length: TotalProfileVisibilitySettings },
        (_, i) => ['visible', i < 4 ? 'Contact' : 'Education and Other Information']);

    useFocusEffect(   // update the profile visibility settings on the page
        React.useCallback(() => {
            setCurrentProfileVisibilitySettings((prev) => {
                const updated = [...prev];
                profileSettings.forEach(setting => {
                    updated[Number(setting.setting_id)][0] = setting.value;
                });
                return updated;
            });
        }, [profileSettings])
    );
    const [currentProfileVisibilitySettings, setCurrentProfileVisibilitySettings] = useState(initialVisibilityValues);
    return (
        <ProfileVisibility settings={currentProfileVisibilitySettings || []} />
    )
}

export default ProfileVisibilitySettings
