import {useEffect, useState} from 'react'
import * as deepcopy from 'deepcopy';

import dataJson from './data.json';
import styles from './css/App.module.css';

function App() {
  const [variations, setVariations] = useState(null);
  const COLORS = 'colors'
  const SIZES = 'sizes'
  const WIDTHS = 'widths'
  const variationTypes = [COLORS, SIZES, WIDTHS]
  const [filteredTypes, setFilteredTypes] = useState(['', '', '']); // 'black', '10.5', 'narrow'

  useEffect( ()=>{
    const colors = {};
    const widths = {};
    const sizes = {};

    for (let [_index, s] of Object.entries(dataJson.shoes)) {
      // build colors
      if(!colors[s.color]) {
        colors[s.color] = {
          [WIDTHS]: [s.width],
          [SIZES]: [s.size],
          disabled: false,
          selected: false
        }
      } else {
        colors[s.color].sizes.push(s.size)
        colors[s.color].widths.push(s.width)
      }

      // build sizes
      if(!sizes[s.size]) {
        sizes[s.size] = {
          [WIDTHS]: [s.width],
          [COLORS]: [s.color],
          disabled: false,
          selected: false
        }
      } else {
        sizes[s.size][COLORS].push(s.color)
        sizes[s.size][WIDTHS].push(s.width)
      }

      // build widths
      if(!widths[s.width]) {
        widths[s.width] = {
          [SIZES]: [s.size],
          [COLORS]: [s.color],
          disabled: false,
          selected: false
        }
      } else {
        widths[s.width][COLORS].push(s.color)
        widths[s.width][SIZES].push(s.size)
      }
    }

    /*
    e.g.
    variations =  {
      colors: {
        red: {
          sizes: [...]
          widths: [...]
          disabled: true
          selected: false
        }, ...
      }
      sizes: {
        standard: {
          colors: [...]
          widths: [...]
          disabled: false
          selected: false
        }, ...
      }
    }
    */
    setVariations({
      colors,
      widths,
      sizes
    })
  }, []);


  // runs when the filters change
  useEffect(()=>{
    if (variations) {
      const updatedVariations = deepcopy(variations);

      // reset all disabled flags and adjust selections to match buttons clicked by user
      variationTypes.forEach((filter, filterIndex)=>{
        Object.keys(updatedVariations[filter]).forEach(name=>{
          updatedVariations[filter][name].disabled = false;
          if(name === filteredTypes[filterIndex]) {
            updatedVariations[filter][name].selected = true;
          } else {
            updatedVariations[filter][name].selected = false;
          }
        })
      })
      
      // apply filters and disable variations as needed
      filteredTypes.forEach((filter, filterIndex)=>{
        const filterName = variationTypes[filterIndex]; // sizes, widths, colors, etc.
        const opposingTypes = [...variationTypes]
        opposingTypes.splice(filterIndex, 1);
          
        for(let opposingType of opposingTypes) {
          Object.keys(updatedVariations[opposingType]).forEach(name=>{
            const variation = updatedVariations[opposingType][name];

            // disable the item if it does not match the filter
            if (filter && !variation[filterName].includes(filter)) {
              variation.disabled = true
            }
          })
        }
      });
      setVariations(updatedVariations);
    }
  }, [filteredTypes])


  function handleOnFilter(button) {
    if(!button.disabled){
      const updatedFilteredTypes = [...filteredTypes];
      const index = variationTypes.indexOf(button.type);
      
      if (updatedFilteredTypes[index] == button.name) {
        // clear filter
        updatedFilteredTypes[index] = '';
      } else {
        updatedFilteredTypes[index] = button.name;
      }
      setFilteredTypes(updatedFilteredTypes)
    }
  }
  
  const variationButtons = [];
  variationTypes.forEach((type, index)=>{
    if (variations) {
      for (let name of Object.keys(variations[type])) {
        if (!variationButtons[index]) {
          variationButtons[index] = [];
        }        
        variationButtons[index].push({
          name,
          type,
          ...variations[type][name]
        })
        
      }
    }
  })

  return (
    <div className={styles.App}>
      <ul>
        {
          variationTypes?.map((type, index)=>{ 
            return <ul key={index}>
              {
                variationButtons[index]?.map((button)=>{
                  const disabled = button.disabled ? styles.disabled : ''
                  const selected = button.selected ? styles.selected : ''
                  return <li key={`${button.name}`} className={`${disabled} ${selected}`} onClick={()=>{
                    handleOnFilter(button);
                  }}>{button.name}</li>
                })
              }
            </ul>
          })
        }
      </ul>
    </div>
  );
}

export default App;
