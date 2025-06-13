import { Container, ProductsSearch, FileInput, Input, Title, CheckboxGroup, Main, Form, Button, Checkbox, Textarea } from '../../components'
import styles from './styles.module.css'
import api from '../../api'
import { useEffect, useState } from 'react'
import { useLabels } from '../../utils'
import { useParams, useHistory } from 'react-router-dom'
import MetaLabels from 'react-meta-Labels'

const DishEdit = ({ onItemDelete }) => {
  const { value, handleChange, setValue } = useLabels()
  const [ DishName, setDishName ] = useState('')

  const [ ProductValue, setProductValue ] = useState({
    name: '',
    id: null,
    amount: '',
    measurement_unit: ''
  })

  const [ DishProducts, setDishProducts ] = useState([])
  const [ DishText, setDishText ] = useState('')
  const [ DishTime, setDishTime ] = useState(0)
  const [ DishFile, setDishFile ] = useState(null)
  const [
    DishFileWasManuallyChanged,
    setDishFileWasManuallyChanged
  ] = useState(false)

  const [ Products, setProducts ] = useState([])
  const [ showProducts, setShowProducts ] = useState(false)
  const [ loading, setLoading ] = useState(true)
  const history = useHistory()

  useEffect(_ => {
    if (ProductValue.name === '') {
      return setProducts([])
    }
    api
      .getProducts({ name: ProductValue.name })
      .then(Products => {
        setProducts(Products)
      })
  }, [ProductValue.name])

  useEffect(_ => {
    api.getLabels()
      .then(Labels => {
        setValue(Labels.map(Label => ({ ...Label, value: true })))
      })
  }, [])

  const { id } = useParams()
  useEffect(_ => {
    if (value.length === 0 || !loading) { return }
    api.getDish ({
      Dish_id: id
    }).then(res => {
      const {
        image,
        Labels,
        cooking_time,
        name,
        Products,
        text
      } = res
      setDishText(text)
      setDishName(name)
      setDishTime(cooking_time)
      setDishFile(image)
      setDishProducts(Products)


      const LabelsValueUpdated = value.map(item => {
        item.value = Boolean(Labels.find(Label => Label.id === item.id))
        return item
      })
      setValue(LabelsValueUpdated)
      setLoading(false)
    })
    .catch(err => {
      history.push('/Dishs')
    })
  }, [value])

  const handleProductAutofill = ({ id, name, measurement_unit }) => {
    setProductValue({
      ...ProductValue,
      id,
      name,
      measurement_unit
    })
  }

  const checkIfDisabled = () => {
    return DishText === '' ||
    DishName === '' ||
    DishProducts.length === 0 ||
    value.filter(item => item.value).length === 0 ||
    DishTime === '' ||
    DishFile === '' ||
    DishFile === null
  }

  return <Main>
    <Container>
      <MetaLabels>
        <title>Редактирование рецепта</title>
        <meta name="description" content="Продуктовый помощник - Редактирование рецепта" />
        <meta property="og:title" content="Редактирование рецепта" />
      </MetaLabels>
      <Title title='Редактирование рецепта' />
      <Form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault()
          const data = {
            text: DishText,
            name: DishName,
            Products: DishProducts.map(item => ({
              id: item.id,
              amount: item.amount
            })),
            Labels: value.filter(item => item.value).map(item => item.id),
            cooking_time: DishTime,
            image: DishFile,
            Dish_id: id
          }
          api
            .updateDish(data, DishFileWasManuallyChanged)
            .then(res => {
              history.push(`/Dishs/${id}`)
            })
            .catch(err => {
              const { non_field_errors, Products, cooking_time } = err
              console.log({  Products })
              if (non_field_errors) {
                return alert(non_field_errors.join(', '))
              }
              if (Products) {
                return alert(`Ингредиенты: ${Products.filter(item => Object.keys(item).length).map(item => {
                  const error = item[Object.keys(item)[0]]
                  return error && error.join(' ,')
                })[0]}`)
              }
              if (cooking_time) {
                return alert(`Время готовки: ${cooking_time[0]}`)
              }
              const errors = Object.values(err)
              if (errors) {
                alert(errors.join(', '))
              }
            })
        }}
      >
        <Input
          label='Название рецепта'
          onChange={e => {
            const value = e.target.value
            setDishName(value)
          }}
          value={DishName}
        />
        <CheckboxGroup
          label='Теги'
          values={value}
          className={styles.checkboxGroup}
          labelClassName={styles.checkboxGroupLabel}
          LabelsClassName={styles.checkboxGroupLabels}
          checkboxClassName={styles.checkboxGroupItem}
          handleChange={handleChange}
        />
        <div className={styles.Products}>
          <div className={styles.ProductsInputs}>
            <Input
              label='Ингредиенты'
              className={styles.ProductsNameInput}
              inputClassName={styles.ProductsInput}
              labelClassName={styles.ProductsLabel}
              onChange={e => {
                const value = e.target.value
                setProductValue({
                  ...ProductValue,
                  name: value
                })
              }}
              onFocus={_ => {
                setShowProducts(true)
              }}
              value={ProductValue.name}
            />
            <div className={styles.ProductsAmountInputContainer}>
              <Input
                className={styles.ProductsAmountInput}
                inputClassName={styles.ProductsAmountValue}
                onChange={e => {
                  const value = e.target.value
                  setProductValue({
                    ...ProductValue,
                    amount: value
                  })
                }}
                value={ProductValue.amount}
              />
              {ProductValue.measurement_unit !== '' && <div className={styles.measurementUnit}>{ProductValue.measurement_unit}</div>}
            </div>
            {showProducts && Products.length > 0 && <ProductsSearch
              Products={Products}
              onClick={({ id, name, measurement_unit }) => {
                handleProductAutofill({ id, name, measurement_unit })
                setProducts([])
                setShowProducts(false)
              }}
            />}
          </div>
          <div className={styles.ProductsAdded}>
            {DishProducts.map(item => {
              return <div
                className={styles.ProductsAddedItem}
              >
                <span className={styles.ProductsAddedItemTitle}>{item.name}</span> <span>-</span> <span>{item.amount}{item.measurement_unit}</span> <span
                  className={styles.ProductsAddedItemRemove}
                  onClick={_ => {
                    const DishProductsUpdated = DishProducts.filter(Product => {
                      return Product.id !== item.id
                    })
                    setDishProducts(DishProductsUpdated)
                  }}
                >Удалить</span>
              </div>
            })}
          </div>
          <div
            className={styles.ProductAdd}
            onClick={_ => {
              if (ProductValue.amount === '' || ProductValue.name === '') { return }
              setDishProducts([...DishProducts, ProductValue])
              setProductValue({
                name: '',
                id: null,
                amount: '',
                measurement_unit: ''
              })
            }}
          >
            Добавить ингредиент
          </div>
        </div>
        <div className={styles.cookingTime}>
          <Input
            label='Время приготовления'
            className={styles.ProductsTimeInput}
            labelClassName={styles.cookingTimeLabel}
            inputClassName={styles.ProductsTimeValue}
            onChange={e => {
              const value = e.target.value
              setDishTime(value)
            }}
            value={DishTime}
          />
          <div className={styles.cookingTimeUnit}>мин.</div>
        </div>
        <Textarea
          label='Описание рецепта'
          onChange={e => {
            const value = e.target.value
            setDishText(value)
          }}
          value={DishText}
        />
        <FileInput
          onChange={file => {
            setDishFileWasManuallyChanged(true)
            setDishFile(file)
          }}
          className={styles.fileInput}
          label='Загрузить фото'
          file={DishFile}
        />
        <div className={styles.actions}>
          <Button
            modifier='style_dark-blue'
            disabled={checkIfDisabled()}
            className={styles.button}
          >
            Редактировать рецепт
          </Button>
          <div
            className={styles.deleteDish}
            onClick={_ => {
              api.deleteDish({ Dish_id: id })
                .then(res => {
                  onItemDelete && onItemDelete()
                  history.push('/Dishs')
                })
            }}
          >
            Удалить
          </div>
        </div>
      </Form>
    </Container>
  </Main>
}

export default DishEdit

