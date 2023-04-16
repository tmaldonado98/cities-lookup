import { useEffect, useState } from 'react';
import './Main.css';
import Header from './Header';
import ApiCards from './ApiCards';
import MyContext from './Context';
import Stats from './Stats';

import { Location } from './Location';
import { Heading, Text, Input, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import axios from 'axios';

function Main() {
  const [isAnimated, setIsAnimated] = useState(false)
  const [text, setText] = useState('');
  const [cityData, setCityData] = useState('');
  const [embeddedResults, setEmbeddedResults] = useState('');
  const [stockData, setStockData] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(false);
  const [placeData, setPlaceData] = useState('');
  const [selectedGeo, setSelectedGeo] = useState('');

  
  useEffect(() => {
    // () =>{
      axios.get(`https://api.teleport.org/api/cities/?search=${text}`,
      {headers: {'Content-Type': 'application/json'}})
      .then(response => {
        setStockData(response.data._embedded["city:search-results"])
      })
      .catch(error => console.log(error));
    // }
  }, [])

    useEffect(() => {
      console.log(stockData)
    }, [stockData])

    function handleChange(event){
      setText(event.target.value);
    }
    
    

  function handleSearch(){
    axios.get(`https://api.teleport.org/api/cities/?search=${text}`, 
    {headers: {'Content-Type': 'application/json'}})
    
    .then(response => {
      setIsAnimated(true)
      setCityData(response.data)
      setEmbeddedResults(response.data._embedded["city:search-results"]);
    })
    .catch(error => console.log(error));

  }
  

  useEffect(() => {
    console.log(cityData);
    console.log(embeddedResults);

  }, [cityData])
  

  function capitalizeFirstLetter(str) {
    const words = str.split(" ");

    const capitalizedWords = words.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    );

  // Join the capitalized words back into a string
  setText(capitalizedWords.join(" "));
  }


  function detectEnter(e){  
    capitalizeFirstLetter(e.target.value);
    if (e.keyCode === 13) {
      handleSearch();
    }
  }

  useEffect(() => {
    console.log(selectedGeo)
  }, [selectedGeo])


  return (
    <MyContext.Provider value={[ {selectedPlace, setSelectedPlace}, { selectedGeo, setSelectedGeo} ]}>
    <> 
      <Header />
      <section>
        <motion.div id='container-location'
          animate={{x: isAnimated && '25vw', y: isAnimated && '-15vh', width: isAnimated && '30%'}}
          transition={{duration: 0.75}}
        >
          <div id='location-comp'>   
            <Text size='lg'>Show me information for:</Text>
            <Input onChange={handleChange} onKeyDown={(e) => detectEnter(e)} value={text} size='md' htmlSize={20} width='auto' variant='flushed' placeholder='e.g. Los Angeles, United States'></Input>  
            {/*  style={{textTransform: "uppercase"}} */}
            <Button onClick={handleSearch} variant='solid'>Search</Button>
          </div>        

        </motion.div>

        {selectedPlace === false &&
        <div id='search-results'>
          {embeddedResults && embeddedResults.map(each => <ApiCards cardData={each.matching_full_name} fullData={each}/>)}
        </div>}

        {selectedPlace === true && 
        <div id='selected-place'>
          {selectedGeo !== '' && <Stats data={selectedGeo} />}
        </div>}
      </section>

      <section>
        <Heading as='h2' size='md'>Some Cities You Might Like...</Heading>
        <p>{stockData ? stockData.map(each => each.matching_full_name) : ''}</p>
      </section>
      <main>



      </main>
      
    </>
    </MyContext.Provider>
  );
}

export default Main;