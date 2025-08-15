import React, { useState } from 'react'
import EmailNtfnSetting from '@/app/pages/Profile/Profile-root/Profile-root-components/Profile-navbar/Settings/Settings-navbar/Email/EmailContent';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '@/app/store/hooks';

const EmailContent = () => {
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
        <EmailNtfnSetting settings={currentEmailNotificationSettings || []} />
    )
}

export default EmailContent
