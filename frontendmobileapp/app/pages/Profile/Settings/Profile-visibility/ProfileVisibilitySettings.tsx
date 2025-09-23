import ProfileVisibility from './ProfileVisibility';
import { useAppSelector } from '@/app/store/hooks';
import React from 'react'

const ProfileVisibilitySettings = () => {
    const TotalProfileVisibilitySettings = 8;  // Total number of profile visibility settings
    const profileSettings = useAppSelector(
    state => state.profile.settings.profileVisibilitySettings
    );

    // create changes on screen directly from Redux-store
    const currentProfileVisibilitySettings = React.useMemo(() => {
        const updated = Array.from(  // default value is true
            { length: TotalProfileVisibilitySettings },
            (_, i) => ['visible', i < 4 ? 'Contact' : 'Education and Other Information']
        );

        profileSettings.forEach(setting => {
            updated[Number(setting.setting_id)][0] = setting.value;
        });

        return updated;
    }, [profileSettings, TotalProfileVisibilitySettings]);

   
    return (
        <ProfileVisibility settings={currentProfileVisibilitySettings || []} />
    )
}

export default ProfileVisibilitySettings
