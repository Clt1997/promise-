!( function ( window ) {

  function Promise ( executor ) {
    //创建一个promise对象,插入status data callbacks等属性
    this.status = 'pending'
    this.data = undefined
    this.callbacks = []

    const self = this

    function resolve ( value ) {
      //如果状态已被改变则直接返回
      if ( self.status !== 'pending' ) {
        return
      }

      //如果是pending,status 改为 resolved,data 内传入参数 value
      self.status = 'resolved'
      self.data = value
      //同时执行回调函数  判断是否存在回调
      if ( self.callbacks.length > 0 ) {
        //异步执行回调
        //遍历  调用.then传入的 onResolved 方法
        setTimeout( self.callbacks.forEach( callbackObj => callbackObj.onResolved( value ) ) )
      }
    }

    function reject ( reason ) {
      //如果状态已被改变则直接返回
      if ( self.status !== 'pending' ) {
        return
      }

      //如果是pending,status 改为 rejected,data 内传入参数 reason
      self.status = 'rejected'
      self.data = reason
      //同时执行回调函数  判断是否存在回调
      if ( self.callbacks.length > 0 ) {
        //异步执行回调
        //遍历  调用.then传入的 onRejected 方法
        setTimeout( self.callbacks.forEach( element => element.onRejected( reason ) ) )
      }
    }

    try {
      // 立即同步执行执行器函数
      executor( resolve, reject )
    } catch ( error ) {
      // 一旦捕获到异常, 当前promise变为失败
      reject( error )
    }

  }


  Promise.prototype.then = function ( onResolved, onRejected ) {
    const self = this
    const status = this.status
    // 如果onResolved没有指定为函数, 直接将接收到的value传递给新的promise
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    // 如果onRejected没有指定为函数,直接将接收的reason抛出让新的promise进入失败
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }


    return new Promise( ( resolve, reject ) => {

      /*
      执行成功/失败的回调函数, 根据执行的结果来指定新的promise的结果
      */
      function handle ( callback ) {
        try {
          const result = callback( self.data )
          // 如果回调函数执行的结果为promise对象
          // 将这个promise对象的结果为新的promise对象的结果
          if ( result instanceof Promise ) {
            /* result.then(
              value => resolve(value),
              reason => reject(reason)
            ) */
            result.then( resolve, reject )
            /*  result.then((value) => {
                resolve(value)
              }, (reason) => {
                reject(reason)
              }) */
          } else {
            resolve( result )
          }

        } catch ( error ) {
          reject( error )
        }
      }

      if ( status === 'resolved' ) { // 当前promise已经成功了
        // 立即异步调用onResolved
        setTimeout( () => {
          handle( onResolved )
        } )
      } else if ( status === 'rejected' ) { // 当前promise已经失败了
        // 立即异步调用onRejected
        setTimeout( () => {
          handle( onRejected )
        } )
      } else { // 当前promise的结果还未确定
        // 将2个回调函数保存到callbacks
        /* self.callbacks.push({
          onResolved,
          onResjected
        }) */

        self.callbacks.push( {
          onResolved ( value ) {
            handle( onResolved )
          },
          onRejected ( reason ) {
            handle( onRejected )
          }
        } )
      }
    } )
  }

  Promise.prototype.then = function ( onResolved, onRejected ) {
    const self = this
    onResolved = typeof onResolved === 'function' ? onResolved : value => value
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
    return new Promise( ( resolve, reject ) => {
      function handler ( callback ) {
        try {
          const result = callback( self.data )
          if ( result instanceof Promise ) {
            result.then( resolve, reject )
          } else {
            resolve( result )
          }
        } catch ( error ) {
          reject( error )
        }
      }
      if ( self.status = 'resolved' ) {
        setTimeout( handler.bind( null, onResolved ) )
      } else if ( self.status = 'rejected' ) {
        setTimeout( handler.bind( null, onRejected ) )
      } else {
        self.callbacks.push( {
          onResolved ( value ) {
            return handler( onResolved )
          },
          onRejected ( reason ) {
            return handler( onRejected )
          }
        } )
      }
    } )

  }

  Promise.prototype.catch = function ( onRejected ) {
    return this.then( undefined, onRejected )
  }

  Promise.resolve = function ( value ) {
    return new Promise( ( resolve, reject ) => {
      if ( value instanceof Promise ) {
        value.then( resolve, reject )
      } else {
        resolve( value )
      }
    } )
  }

  Promise.reject = function ( reason ) {
    return new Promise( ( resolve, reject ) => {
      reject( reason )
    } )
  }

  Promise.all = function ( promises ) {
    let resolvedCount = 0
    let values = []
    return new Promise( ( resolve, reject ) => {
      promises.forEach( ( item, index ) => {
        Promise.resolve( item ).then(
          value => {
            resolvedCount++
            values[ index ] = value
            if ( resolvedCount === promises.length ) {
              resolve( values )
            }
          },
          reason => {
            reject( reason )
          }
        )
      } )
    } )
  }

  Promise.all = function ( promises ) {
    let count = 0
    let values = []
    return new Promise( ( resolve, reject ) => {
      for ( let i = 0; i < promises.length; i++ ) {
        let item = promises[ i ]
        Promise.resolve( item ).then(
          value => {
            count++
            values[ i ] = value
            if ( count === promises.length - 1 ) {
              resolve( values )
            }
          },
          reason => reject( reason ) )
      }
    } )
  }

  Promise.race = function ( promises ) {
    return new Promise( ( resolve, reject ) => {
      promises.forEach( item => {
        Promise.resolve( item ).then(
          value => value,
          reason => reason
        )
      } )
    } )
  }


  window.Promise = Promise



  /*
   Promise.resolve = function ( value ) {
       return new Promise( ( resolve, reject ) => {
         if ( value instanceof Promise ) {
           value.then( resolve, reject )
         } else {
           resolve( value )
         }
       } )
     }

     Promise.reject = function ( reason ) {
       return new Promise( ( resolve, reject ) => {
         reject( result )
       } )
     }

     Promise.all = function ( promises ) {
       let resolvedCount = 0
       let values = []
       return new Promise( ( resolve, reject ) => {
         promises.forEach( ( item, index ) => {
           promises.resolve( item, index ).then(
             value => {
               resolvedCount++
               values[ index ] = value
               if ( resolvedCount == promises.length ) {
                 resolve( values )
               }
             },
             reason => reject( reason )
           )
         } )
       } )
     }

     Promise.race = function ( promises ) {
       return new Promise( ( resolve, reject ) => {
         promises.forEach( ( item ) => {
           promises.resolve( item ).then(
             value => resolve( value ),
             reason => reject( reason )
           )
         } )
       } )
     }
  */

} )( window )
