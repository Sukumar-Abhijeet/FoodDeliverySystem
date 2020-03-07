import React, { propTypes } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

export const  TabIcon = ({ focused, iconDefault, iconFocused, tintColor, size }) => {
    return (
        <Icon
            name={focused ? iconFocused : iconDefault}
            size={focused ? size : size}
            style={focused ? ({color:"#cd2121"}):({color:"#555"})  }
        />
    );
};
TabIcon.propTypes = {
    // focused: false,
    //  tintColor:'#cd2121',
    // size: {size}
};
TabIcon.defaultProps = {
    // focused: false,
    // size: {size}
};

export default TabIcon;