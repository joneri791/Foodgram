import React, { useState } from "react";
import { useLabels } from './index.js'
import api from '../api'

export default function useDishs () {
  const [ Dishs, setDishs ] = useState([])
  const [ DishsCount, setDishsCount ] = useState(0)
  const [ DishsPage, setDishsPage ] = useState(1)
  const { value: LabelsValue, handleChange: handleLabelsChange, setValue: setLabelsValue } = useLabels()

  const handleLike = ({ id, toLike = true }) => {
    const method = toLike ? api.addToBookmarks.bind(api) : api.removeFromBookmarks.bind(api)
    method({ id }).then(res => {
      const DishsUpdated = Dishs.map(Dish => {
        if (Dish.id === id) {
          Dish.is_Bookmarkd = toLike
        }
        return Dish
      })
      setDishs(DishsUpdated)
    })
    .catch(err => {
      const { errors } = err
      if (errors) {
        alert(errors)
      }
    })
  }

  const handleAddToCart = ({ id, toAdd = true, callback }) => {
    const method = toAdd ? api.addToOrders.bind(api) : api.removeFromOrders.bind(api)
    method({ id }).then(res => {
      const DishsUpdated = Dishs.map(Dish => {
        if (Dish.id === id) {
          Dish.is_in_cart = toAdd
        }
        return Dish
      })
      setDishs(DishsUpdated)
      callback && callback(toAdd)
    })
    .catch(err => {
      const { errors } = err
      if (errors) {
        alert(errors)
      }
    })
  }

  return {
    Dishs,
    setDishs,
    DishsCount,
    setDishsCount,
    DishsPage,
    setDishsPage,
    LabelsValue,
    handleLike,
    handleAddToCart,
    handleLabelsChange,
    setLabelsValue
  }
}

