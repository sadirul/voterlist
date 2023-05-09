import changeNavigationBarColor from 'react-native-navigation-bar-color'
import DropDownPicker from 'react-native-dropdown-picker'
import NetInfo from "@react-native-community/netinfo"
import CustomHelpers from './Helpers/CustomHelpers'
import {useEffect, useState} from 'react'
import RNFetchBlob from 'rn-fetch-blob'
import { 
  TouchableOpacity,
  PermissionsAndroid,
  ToastAndroid,
  ActivityIndicator,
  StatusBar,
  BackHandler,
  Text, 
  View, 
  StyleSheet,
  // ImageBackground, 
  Image,
  TouchableWithoutFeedback,
} from 'react-native'

import { 
  BannerAd,
  BannerAdSize,
  TestIds,
  useInterstitialAd
} from 'react-native-google-mobile-ads'

export default function HomeScreen({navigation}) {
  const [isInternet, setIsInternet] = useState(false)
  const disticts = require('./Helpers/District.json')
  const AdsConfig = require('../../AdsConfig.json')
  const adUnitId = __DEV__ ? TestIds.BANNER : AdsConfig.banner_id;
  const interstitial_id = __DEV__ ? TestIds.INTERSTITIAL : AdsConfig.intersticial_id;


  // INTERSTITIAL ADS
  const { isLoaded, isClosed, load, show } = useInterstitialAd(interstitial_id, {
    requestNonPersonalizedAdsOnly: true,
  });

  useEffect(() => {
    load();
  }, [load, isClosed]);

  
  
  useEffect(()=>{
    changeNavigationBarColor('#02A8F4')
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsInternet(state.isConnected)
    })
    
    return () =>{
      unsubscribe()
    }
    
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      setOpen(false)
    })
    return unsubscribe
  }, [navigation])


  const { config, fs } = RNFetchBlob
  const RootDir = `${fs.dirs.DownloadDir}/WB Voter List/`
  const downloadFile = async (fileUrl) => {
    ToastAndroid.show("Downloading...", ToastAndroid.SHORT)
    let FILE_URL = fileUrl
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        path: `${RootDir}${downloadFileName}.pdf`,
        description: 'Downloading Voter List...',
        notification: true,
        useDownloadManager: true,   
      },
    }
    await config(options)
      .fetch('GET', FILE_URL)
      .then(res => {
        setShowShareDiv(true)
        ToastAndroid.show('File Downloaded Successfully.', ToastAndroid.SHORT)
        if (isLoaded) {
          show();
        }
      })
  }


  const checkPermission = async (url) => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message:
              'Application needs access to your storage to download File',
          }
        )
        if ('granted' === PermissionsAndroid.RESULTS.GRANTED) {
          downloadFile(url)
        } else {
          ToastAndroid.show('Storage Permission Not Granted!', ToastAndroid.SHORT)
        }
      } catch (err) {

      }
    
  }
    // const backgroundImg = require('../images/bg.jpg')
    const logoImg = require('../images/icon.png')

    const [loading, setLoading] = useState(false)

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState(null)
    const [items, setItems] = useState([
    ])

    const [districtValue, setDistrictValue] = useState(null)
    const [openDistrict, setOpenDistrict] = useState(false)
    const [distict, setDistrict] = useState(disticts)
    
    const [polingOpen, setPolingOpen] = useState(false)
    const [Polingvalue, setPolingvalue] = useState(null)
    const [polingList, setPolingList] = useState([
    ])

    const [downloadFileName, setdownloadFileName] = useState('')
    const {http, URL, isFileExists, shareFile} = CustomHelpers()

    const [shareableFile, setShareableFile] = useState('')
    const [fileName, setFileName] = useState('')

    const handelDownload = async () => {
      if(!isInternet){
        ToastAndroid.show('Please connect Internet!', ToastAndroid.SHORT)
        return false
      }
      
      if(!districtValue){
        ToastAndroid.show('Please select District!', ToastAndroid.SHORT)
        return false
      }

      if(!value){
        ToastAndroid.show('Please select AC Name!', ToastAndroid.SHORT)
        return false
      }

      if(!Polingvalue){
        ToastAndroid.show('Please select Poling Station!', ToastAndroid.SHORT)
        return false
      }
      
      let checkThisFile = `${RootDir}${downloadFileName}.pdf`
      setShareableFile(`file://${checkThisFile}`)
      setFileName(`${downloadFileName}.pdf`)
      const exists = await isFileExists(checkThisFile)
      
      if(exists){
        ToastAndroid.show("Voter List already exists!", ToastAndroid.SHORT)
        setLoading(false)
        setShowShareDiv(true)
        return false
      }else{
        setShowShareDiv(false)
      }

      checkPermission(URL + `FinalRoll.aspx?DCID=${districtValue}&ACID=${value}&PSID=${Polingvalue}`)

    }


    const getAcName = async (districtID) => {
      // setValue(null);
      if(!isInternet){
        ToastAndroid.show('Please connect Internet!', ToastAndroid.SHORT)
        return false
      }

      if(!districtID){
        ToastAndroid.show('Please select District!', ToastAndroid.SHORT)
        return false
      }

      setLoading(true)
      
      await http.post(`CEOService.asmx/ShowACDetails`, {
        officerdetails: {
          DistrictID: districtID,
        }
      })
        .then(response => {
          setLoading(false)
            const copy = []
            response.data.d.forEach(function (item) {
                copy.push({label:`${item.ACNo}. ${item.ACName}`, value: item.ACNo})
            })
            setItems(copy)
        })
        .catch(error => {
          setLoading(false)

        })
    }


    const getPolingList = async (acID) => {
      // setPolingvalue(null)
      if(!isInternet){
        ToastAndroid.show('Please connect Internet!', ToastAndroid.SHORT)
        return false
      }

      if(!acID){
        ToastAndroid.show('Please select AC Name!', ToastAndroid.SHORT)
        return false
      }

      setLoading(true)
      await http.post(`CEOService.asmx/ShowPSDetails`, {
        pollinglist: {
          ACNO: acID,
          DistrictNO: districtValue,
      }
      })
        .then(response => {
          setPolingList([])
          setLoading(false)
            const copy = []
            response.data.d.forEach(function (item) {
                copy.push({label:`${item.PSNO}. ${item.PSName}`, value: item.PSNO})
            })
            setPolingList(copy)
        })
        .catch(error => {
          setLoading(false)
        })
    }
    

    const [lastBackPressTime, setLastBackPressTime] = useState(0)

    useEffect(() => {
      const onBackPress = () => {
        if(navigation.canGoBack()){
          navigation.goBack()
          return true
        }
        const currentTime = new Date().getTime()
        if (currentTime - lastBackPressTime < 2000) {
          BackHandler.exitApp()
        } else {
          setLastBackPressTime(currentTime)
          ToastAndroid.show('Press back again to exit', ToastAndroid.LONG)
          return true
        }
      }
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => backHandler.remove()
    }, [lastBackPressTime])

    const [showShareDiv, setShowShareDiv] = useState(false)

    const shareFileNow = async ()=>{
      await shareFile(shareableFile, 'Share Voter List', `Share Voter List - ${fileName}`)
    }

    const openFile = () => {
      const path = shareableFile.replace("file:///", '/')
      RNFetchBlob.android.actionViewIntent(path, 'application/pdf')
    }

  
    return (
      <>
        <StatusBar backgroundColor='#02A8F4'/>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <View style={styles.container}>
          {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0000ff" style={styles.indicator}/>
            <Text style={styles.fetchingStyleText}>Fetching data...</Text>
          </View>
        )}
          {/* <ImageBackground source={backgroundImg} resizeMode="cover" style={styles.backgroundImg}> */}
            <View style={styles.logoImgView}>
              <Image style={styles.logoImg}  source={logoImg}/>
            </View>

            <Text style={styles.inputTitle}>Select District* :</Text>
            <View style={styles.dropDownStyle}>
                <DropDownPicker
                  open={openDistrict}
                  value={districtValue}
                  items={distict}
                  setOpen={setOpenDistrict}
                  setValue={setDistrictValue}
                  setItems={setDistrict}
                  closeOnBackPressed={true}
                  onOpen={()=>{
                    setShowShareDiv(false)
                  }}
                  maxHeight={220}
                  searchable={true}
                  searchPlaceholder='Search District...'
                  onChangeValue={(id) => {
                    getAcName(id)
                    setValue(null)
                    setItems([])
                  }}
                  listMode="MODAL"
                  autoScroll
                  placeholder='Select District'
                  style={styles.drpdown}
                  
                />  
              </View>

            <Text style={styles.inputTitle}>Select AC Name* :</Text>
            
              <View style={styles.dropDownStyle}>
                <DropDownPicker
                  open={open}
                  value={value}
                  items={items}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
                  closeOnBackPressed={true}
                  onOpen={()=>{
                    setShowShareDiv(false)
                  }}
                  maxHeight={220}
                  searchable={true}
                  searchPlaceholder='Search AC Name...'
                  onChangeValue={(id) => {
                    if(id){
                      getPolingList(id)
                    }
                    setPolingList([])
                    setPolingvalue(null)
                  }}
                  listMode="MODAL"
                  autoScroll
                  placeholder='Select AC Name'
                  style={styles.drpdown}
                />  
              </View>

              <Text style={styles.inputTitle}>Select Poling Station* :</Text>
            
            <View style={styles.dropDownStyle}>
              <DropDownPicker
                open={polingOpen}
                value={Polingvalue}
                items={polingList}
                setOpen={setPolingOpen}
                setValue={setPolingvalue}
                setItems={setPolingList}
                closeOnBackPressed={true}
                onOpen={()=>{
                  setShowShareDiv(false)
                }}
                maxHeight={220}
                searchable={true}
                searchPlaceholder='Search Poling Station...'
                listMode="MODAL"
                autoScroll
                placeholder='Select Poling Station'
                onChangeValue={(itemIndex) => {
                  try{
                    if(itemIndex && polingList[itemIndex-1].label){
                      setdownloadFileName(polingList[itemIndex-1].label.trim())
                    }
                  }catch(err) {

                  }
                }}
                style={styles.drpdown}
              />  
            </View>


            
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity style={styles.downloadBtnView} onPress={(event) => handelDownload()}>
                <Text style={styles.openShareStatus}>Download</Text>
              </TouchableOpacity>
            </View>
            {showShareDiv && 
              <View style={styles.exists}>
                <TouchableOpacity style={[styles.openShareBtn, {backgroundColor:'#00b300'}]} onPress={(event) => openFile()}>
                    <Text style={styles.openShareStatus}>Open</Text>
                </TouchableOpacity>
              
                <TouchableOpacity style={[styles.openShareBtn, {backgroundColor:'#ff0066'}]} onPress={(event) => shareFileNow()}>
                    <Text style={styles.openShareStatus}>Share</Text>
                </TouchableOpacity>
              </View>
            }

          {/* </ImageBackground>       */}
          <View style={{ flex: 1,justifyContent: 'flex-end', }}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
            />
          </View>
      </View>
      </TouchableWithoutFeedback>
    </>
    )
}

  const styles = StyleSheet.create({
    container : {
       flex: 1,
    },
    exists:{
      backgroundColor: 'white',
      paddingHorizontal: 20,
      margin: 10,
      height: 50,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      borderRadius: 6,
    },
    // backgroundImg: {
    //   width: '100%',
    //   flex: 1,
    // },
    logoImgView: {
      width: '100%',
      height: 100,
      marginTop: 10,
      textAlign: 'center',
      alignItems: 'center',
    },
    logoImg: {
      width: 100,
      height : 100,
      borderColor: 'white',
      borderWidth: 2,
      borderRadius: 50
    },
    inputTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'left',
      marginLeft: 10,
      color: 'black'
    },
    textInput: {
      backgroundColor: 'white',
      margin: 10,
      fontSize: 18,
      fontWeight: 'bold',
      paddingHorizontal: 8,
    },
    dropDownStyle: {
      margin: 10,
      zIndex: 1,
    },
    drpdown:{
      borderColor: '#ccc'
    },
    downloadBtnView: {
      alignItems: 'center',
      width: '32.5%',
      backgroundColor: '#02A8F4',
      padding: 8,
      justifyContent: 'center',
      borderRadius: 25,
      borderColor: '#ccc',
      borderWidth: 2
    },
    openShareBtn: {
      width: '40.5%',
      backgroundColor: 'red',
      padding: 8,
      justifyContent: 'center',
      borderRadius: 25,
      borderWidth: 1,
      borderColor: '#ccc'
    },
    openShareStatus: {
      color: 'white',
      textAlign: 'center',
      borderRadius: 25,
      fontWeight: 'bold',
      fontSize: 18,
    },
    loader: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    fetchingStyleText: {
      fontWeight: 'bold',
      fontSize: 20
    },
    indicator: {
      marginTop: 100
    }
  })
