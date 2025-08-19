import React, { useState } from 'react'
import Email from './Email';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/app/store/hooks';

const EmailNtfnSettings = () => {
    const TotalEmailNotificationSettings = 11;  // Total number of email notification settings
    const emailSettings = useAppSelector(state => state.profile.settings.emailNotificationSettings);

    useFocusEffect(   // update the email settings on the page
        React.useCallback(() => {
            setCurrentEmailNotificationSettings((prev) => {
                const updated = [...prev];
                emailSettings.forEach(setting => {
                    updated[Number(setting.setting_id)] = setting.value;
                });
                return updated;
            });
        }, [emailSettings])
    );

    const [currentEmailNotificationSettings, setCurrentEmailNotificationSettings] = useState(Array(TotalEmailNotificationSettings).fill(true));

    return (
        <Email settings={currentEmailNotificationSettings || []} />
    )
}

export default EmailNtfnSettings