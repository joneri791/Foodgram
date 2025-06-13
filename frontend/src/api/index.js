class Api {
  constructor (url, headers) {
    this._url = url
    this._headers = headers
  }

  checkResponse (res) {
    return new Promise((resolve, reject) => {
      if (res.status === 204) {
        return resolve(res)
      }
      const func = res.status < 400 ? resolve : reject
      res.json().then(data => func(data))
    })
  }

  checkFileDownloadResponse (res) {
    return new Promise((resolve, reject) => {
      if (res.status < 400) {
        return res.blob().then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "shopping-list";
          document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
          a.click();    
          a.remove();  //afterwards we remove the element again 
        })
      }
      reject()
    })
  }

  signin ({ email, password }) {
    return fetch(
      '/api/auth/token/login/',
      {
        method: 'POST',
        headers: this._headers,
        body: JSON.stringify({
          email, password
        })
      }
    ).then(this.checkResponse)
  }

  signout () {
    const token = localStorage.getItem('token')
    return fetch(
      '/api/auth/token/logout/',
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  signup ({ email, password, username, first_name, last_name }) {
    return fetch(
      `/api/users/`,
      {
        method: 'POST',
        headers: this._headers,
        body: JSON.stringify({
          email, password, username, first_name, last_name
        })
      }
    ).then(this.checkResponse)
  }

  getUserData () {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/me/`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  changePassword ({ current_password, new_password }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/set_password/`,
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        },
        body: JSON.stringify({ current_password, new_password })
      }
    ).then(this.checkResponse)
  }


  // Dishs

  getDishs ({
    page = 1,
    limit = 6,
    is_Bookmarkd = 0,
    is_in_cart = 0,
    author,
    Labels
  } = {}) {
      const token = localStorage.getItem('token')
      const authorization = token ? { 'authorization': `Token ${token}` } : {}
      const LabelsString = Labels ? Labels.filter(Label => Label.value).map(Label => `&Labels=${Label.slug}`).join('') : ''
      return fetch(
        `/api/Dishs/?page=${page}&limit=${limit}${author ? `&author=${author}` : ''}${is_Bookmarkd ? `&is_Bookmarkd=${is_Bookmarkd}` : ''}${is_in_cart ? `&is_in_cart=${is_in_cart}` : ''}${LabelsString}`,
        {
          method: 'GET',
          headers: {
            ...this._headers,
            ...authorization
          }
        }
      ).then(this.checkResponse)
  }

  getDish ({
    Dish_id
  }) {
    const token = localStorage.getItem('token')
    const authorization = token ? { 'authorization': `Token ${token}` } : {}
    return fetch(
      `/api/Dishs/${Dish_id}/`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          ...authorization
        }
      }
    ).then(this.checkResponse)
  }

  createDish ({
    name = '',
    image,
    Labels = [],
    cooking_time = 0,
    text = '',
    Products = []
  }) {
    const token = localStorage.getItem('token')
    return fetch(
      '/api/Dishs/',
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        },
        body: JSON.stringify({
          name,
          image,
          Labels,
          cooking_time,
          text,
          Products
        })
      }
    ).then(this.checkResponse)
  }

  updateDish ({
    name,
    Dish_id,
    image,
    Labels,
    cooking_time,
    text,
    Products
  }, wasImageUpdated) { // image was changed
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${Dish_id}/`,
      {
        method: 'PATCH',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        },
        body: JSON.stringify({
          name,
          id: Dish_id,
          image: wasImageUpdated ? image : undefined,
          Labels,
          cooking_time: Number(cooking_time),
          text,
          Products
        })
      }
    ).then(this.checkResponse)
  }

  addToBookmarks ({ id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${id}/Bookmark/`,
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  removeFromBookmarks ({ id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${id}/Bookmark/`,
      {
        method: 'DELETE',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  getUser ({ id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/${id}/`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  getUsers ({
    page = 1,
    limit = 6
  }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  // subscriptions

  getSubscriptions ({
    page, 
    limit = 6,
    Dishs_limit = 3
  }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/subscriptions/?page=${page}&limit=${limit}&Dishs_limit=${Dishs_limit}`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  deleteSubscriptions ({
    author_id
  }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/${author_id}/subscribe/`,
      {
        method: 'DELETE',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  subscribe ({
    author_id
  }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/users/${author_id}/subscribe/`,
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  // Products
  getProducts ({ name }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Products/?name=${name}`,
      {
        method: 'GET',
        headers: {
          ...this._headers
        }
      }
    ).then(this.checkResponse)
  }

  // Labels
  getLabels () {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Labels/`,
      {
        method: 'GET',
        headers: {
          ...this._headers
        }
      }
    ).then(this.checkResponse)
  }


  addToOrders ({ id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${id}/cart/`,
      {
        method: 'POST',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  removeFromOrders ({ id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${id}/cart/`,
      {
        method: 'DELETE',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  deleteDish ({ Dish_id }) {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/${Dish_id}/`,
      {
        method: 'DELETE',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkResponse)
  }

  downloadFile () {
    const token = localStorage.getItem('token')
    return fetch(
      `/api/Dishs/download_cart/`,
      {
        method: 'GET',
        headers: {
          ...this._headers,
          'authorization': `Token ${token}`
        }
      }
    ).then(this.checkFileDownloadResponse)
  }
}

export default new Api(process.env.API_URL || 'http://localhost', { 'content-type': 'application/json' })

