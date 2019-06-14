# Promise

      Promise函数内部相关的异步调用将被插入微队列,微队列的优先级比宏队列高的多,宏队列每一项在执行时都要保证微队列是空的.
      Promise的提出解决了回调地狱的问题(callback hell)
      配合ajax和async await使用

## 1.function Promise (executor)

1).生成一个 Promise 对象

      设置 data 、 status 及 callbacks 三个属性
      data 用于存储数据默认值为 undefined,数据由调用 resolve 或 reject 的时候传入
      status 用于标记状态 状态有 pending resolved(fulfilled) rejected 三种
              -pending 为默认状态 表示初始状态
              -resolved 为成功状态,在调用 resolve 函数时改变
              -rejected 为失败状态,在调用 reject 函数时改变
      callbacks 用于存储待处理函数的容器,将在 .then 方法中 push 进

2). executor 执行器 是同步执行的函数

      并在 executor 内传入了 resolve 和 reject 两个函数
      分别用于异步执行所有待处理的 成功的回调 和 失败的回调
      利用 try...catch... 进行异常判断,并在异常时执行reject函数并返回error

3). resolve 和 reject 函数

      执行函数时先进行状态判断,若status不为pending,即状态被改写过则直接返回,保证状态只被改写一次
      若状态为pending则将状态改写为resolved或rejected,并在data内存入当前参数传递的数据
      最后判断callbacks内是否存在待处理函数,若存在则异步调用所有待处理函数
      callbacks仅在promise对象状态为pending状态下调用.then方法时才被push进callbacks容器中
      即executor内的代码段被人为或被迫设置为异步调用时才会写入callbacks容器中

## 2. Promise.prototype.then 方法

1).基本设定

      .then方法存于 Promise 实例对象身上,返回值为一个新的promise对象
      内部需要传入两个参数,且参数需为两个函数
      两个函数分别将在 Promise 对象 status 为 resolved 和 reject 时被调用
      可以链式调用

2).防异常处理

      进行判断,若未传入参数或传入参数不为函数时,
      reject下将直接抛出数据由下一个.then中的函数处理,
      resolve将直接返回数据,交由下一个.then中的函数处理.

3).主体逻辑

      进行状态判定,若状态不为 resolved 也不为 rejected
      在实例身上的callbacks属性中插入.then中传入的函数,以方便Promise中的异步调用若状态为 resolved 或为 rejected 异步执行 try...catch... 中的逻辑。
      尝试将实例带来的data数据传入 相关函数(由我们传入的两个参数) 中,并将执行结果带入判断,
      若结果不为Promise对象,直接将结果传入并调用 resolve 函数,
      若结果为Promise对象,在此Promise对象的.then方法内传入 resolve & reject 函数,
      以方便链式调用，并返回Promise对象,;
      若以上步骤出现异常，则直接将异常信息传入并调用 reject 函数
      此处 resolve& reject 函数调用为返回值Promise对象内的 executor 带回的 function Promise 内写好的函数

## 3. Promise.prototype.catch 方法

      就是.then方法传入 undefined 和 函数 的调用

## 4. Promise.resolve 方法 & Promise.reject 方法

      返回值为Promise对象,是简写方式
      参数不为Promise对象时直接调用 reject 或 resolve 函数
      此处 resolve& reject 函数调用为返回值Promise对象内的 executor 带回的 function Promise 内写好的函数
      参数为Promise对象时 Promise.resolve 方法将在此Promise对象的.then方法内传入 resolve & reject 函数,

## 5. Promise.all 方法 & Promise.race 方法

      Promise.all 方法 & Promise.race 方法都需要传入一个promise对象勾成的数组
      .all在所有promise执行成功时返回一个数组,并将值一一对应的返回
          若有某一个promise执行错误则直接返回错误
      .race在第一个promise执行成功时就立刻返回一个值 (赛跑模式)
      若传入的参数不是promise对象结果为成功(内部执行遍历,并调用Promise.resolve() 处理)
      失败时调用reject()处理 成功时将调用 resolve() 处理值或储存值( Promise.all这么处理 并判断,待处理完后返回)
