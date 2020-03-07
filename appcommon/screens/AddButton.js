import React, { Component } from 'react';
import { View, Text,TouchableOpacity } from 'react-native';
import Display from 'react-native-display';
class AddButton extends Component {
  render(){ 
  if(1){
  return (
    <View>
    <TouchableOpacity>
        <View style={{ height:20, borderWidth: 1, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: 60, borderRadius: 1 }}><Text style={{ color: "#cd2121", fontSize: 14 }}>ADD</Text>
        </View>
    </TouchableOpacity>
    <Display
    enable={true}
    style={{display:'flex',flexDirection:'row',justifyContent: 'center',alignItems: 'center'}}
    >
        <Text style={{ color: "#cd2121", fontSize: 20 ,textAlign:'center'}}>1</Text>
    </Display>
    <View style={{ height:20, borderWidth: 1, borderColor: '#cd2121', justifyContent: 'center', alignItems: 'center', width: 60, borderRadius: 1 }}>
    <Text style={{ color: "#cd2121", fontSize: 14 }}>Remove</Text>
    </View>
    </View>
  );
  }
  }
}
export default AddButton;

