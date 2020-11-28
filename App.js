import React,{useState,useRef, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View ,TextInput,Vibration,TouchableOpacity,Keyboard,Animated,Alert} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist'
import { Feather } from '@expo/vector-icons';


export default function App() {

  const DARK_THEME = "DARK_THEME";
  const LIGHT_THEME = "LIGHT_THEME";
  const [list,setList] = useState([])
  const [inputValue,setInputValue] = useState("")
  const [theme,setTheme] = useState(LIGHT_THEME);
  const [containerBackgroud,setContainerBackground] = useState("white")
  const [textColor,setTextColor] = useState("black")

  const fadeAni = useRef(new Animated.Value(0)).current;

  const showAlert = () =>{
    Alert.alert(
       'Enter something to add'
    )
    }

  const fadeIn = () => {
    Animated.timing(fadeAni, {
      toValue: 1,
      duration: 1000,
      useNativeDriver:false
    }).start();
  };

  useEffect(()=>{
    fadeIn()
  },[])



  useEffect(()=>{
    AsyncStorage.getItem("TODO_APP_DATA")
    .then(res=>{
      if(res)
      setList(JSON.parse(res))
    })
    .catch(err=>console.log(err))

    AsyncStorage.getItem("TODO_APP_THEME")
    .then(res=>{
      console.log("themeeSuccess",res)
      if(!res){
        AsyncStorage.setItem("TODO_APP_THEME",LIGHT_THEME)
      }else{
        if(res === LIGHT_THEME)
          setTheme(LIGHT_THEME)
        else
          setTheme(DARK_THEME)
      }
    })
    .catch(err=>console.log("theme",err))

  },[])

  useEffect(()=>{
      AsyncStorage.setItem("TODO_APP_DATA",JSON.stringify(list))
  },[list])

  useEffect(()=>{
      AsyncStorage.setItem("TODO_APP_THEME",theme)
  },[theme])

  useEffect(()=>{
    if(theme === LIGHT_THEME){
      setContainerBackground("white")
      setTextColor("black")
    }else{
      setContainerBackground("#262626")
      setTextColor("white")
    }
  },[theme])

  const onAddItem = ()=>{
    const body = {
      key: new Date().toISOString(),
      item : inputValue,
      isCompleted : false
    }
    if(!inputValue){
      showAlert()
    }else{
      setList([body,...list])
      setInputValue("")
      Keyboard.dismiss()

    }
    
  }

  const onRemoveItem = (key)=>{
    const items = list.filter(item => item.key !== key )
    setList(items)
    
  }

  const onComplete = (key)=>{
      const items = [...list];
      const item = items.find(el => el.key === key)
      item.isCompleted = !item.isCompleted;
      setList(items)
  }

  const isActiveCompleted = (item,isActive)=>{
            if(item.isCompleted && !isActive)
            return "grey"
            else if(item.isCompleted && isActive)
            return "black"
            else
            return textColor
  }

  const renderList = ({ item, index, drag, isActive })=>(
    <TouchableOpacity
    style={[
      styles.item,
      {
        borderColor: item.isCompleted  ? "grey" : textColor,
        backgroundColor: isActive ? "rgba(187,187,187,.6)" : item.backgroundColor,
      }]} 
      onLongPress={()=>{
        drag()
        Vibration.vibrate(100)
      }}
      >
      <Text 
      style={[
        styles.title,
        {
          textDecorationLine:item.isCompleted ? "line-through" : "none",
          //color:item.isCompleted ? "grey" : textColor,
          color: isActiveCompleted(item,isActive)
        }
        ]}>{item.item}</Text>
      <View 
      style={styles.actions}
      >
      <TouchableOpacity 
         onPress={()=>onComplete(item.key)}
      >
        {
              item.isCompleted ? 
              <AntDesign name="checksquare" size={24} color="#30e670" /> 
              :
              <MaterialIcons name="check-box-outline-blank" size={24} color="#30e670" />
            }
      </TouchableOpacity>
      <TouchableOpacity 
         onPress={()=>onRemoveItem(item.key)}
      >
         <MaterialCommunityIcons name="delete" size={24} color="#ff2626" />
      </TouchableOpacity>
      </View>
    </TouchableOpacity>
    )

  return (
    <View style={[styles.container,{
      backgroundColor:containerBackgroud
    }]}>
      <Animated.View
      style={[
        styles.displayCenter,
        {
          opacity: fadeAni
        }
            ]}>
      <Text style={[styles.heading,
      {
        color:containerBackgroud
      }
      ]}>My ToDos List</Text>
      {
        theme === LIGHT_THEME ? 
        <TouchableOpacity onPress={()=>setTheme(DARK_THEME)}>
          <Feather name="moon" size={24} color={containerBackgroud} />
        </TouchableOpacity> :
        <TouchableOpacity onPress={()=>setTheme(LIGHT_THEME)}>
        <Feather name="sun" size={24} color={containerBackgroud} />
      </TouchableOpacity>
      }
      </Animated.View>


      <View style={[styles.formStyle,
      {
        borderColor: "#ffd026",
        backgroundColor:containerBackgroud
      }
      ]}>
      <TextInput
      style={[styles.input,
        {
          color:textColor
        }]
      }
      placeholder="eg. Pay Bills"
      placeholderTextColor={"grey"} 
      onChangeText = { text => setInputValue(text)}
      value={inputValue}
      />
      <TouchableOpacity style={styles.addButton}
      onPress={onAddItem}
      >
        <MaterialIcons name="add-box" size={30} color="#ffd026" />
      </TouchableOpacity>
      </View>

      {
        list.length > 0 ?
        <DraggableFlatList
        data={list}
        renderItem = {renderList}
        keyExtractor={(item, index) => `draggable-item-${item.key}`}
        onDragEnd={({ data }) => {
          const items = data;
          setList(items)
             }}
        />
        :
        <Text style={styles.centerText}>You don't have any ToDos now.</Text>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
  },
  displayCenter:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:"#ffd026",
    height:75,
    paddingTop:26,
    paddingHorizontal:"4%"
  },
  heading:{
    fontWeight:"bold",
    fontSize:28,
    color:"white"
  },
  bold:{
    fontWeight:"bold",
    fontSize:24,
    color:"white"
  },
  textWhite:{
    color:"white"
  },
  button:{
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#ffd026",
    height: 28,
    width:28,
    borderRadius: 6,
    marginRight:6
  },
  addButton:{
    marginRight:6
  },
  input:{
    flex:.9,
    width: "60%",
    padding:4,
    height:35,
    //backgroundColor:"white",
    color:"#000",
    fontSize:18,
    borderRadius: 6
  },
  formStyle:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginVertical:10,
    width:"92%",
    marginHorizontal:"4%",
    backgroundColor:"white",
    padding:3,
    borderRadius:6,
    borderWidth:2
  },
  item:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginVertical:5,
    paddingHorizontal:10,
    paddingVertical:8,
    borderWidth:1,
    width:"92%",
    marginHorizontal:"4%",
    borderRadius:6
  },
  actions:{
    flex:.18,
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",

  },
  title:{
    flex:.82,
    fontWeight:"bold",
    color:"white",
    fontSize:18
  },
  removeButton:{
    height:24,
    padding:3,
    backgroundColor:"red"
  },
  whiteText:{
    color:"white"
  },
  centerText:{
    marginVertical:100,
    color:"white",
    width:"100%",
    textAlign:"center"
  },
  tinyLogo:{
    height:22,
    width:22,
    marginLeft:10
  },
  addLogo:{
    height:26,
    width:26,
    marginLeft:10
  }
});
