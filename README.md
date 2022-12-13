# Алгоритм авторизации на redux-saga

Отработка логики авторизации на saga. Возможно прерывание процесса через AbortController, работает автоматический refresh токена.

Back-end сделан на laravel с пакетом [lcobucci/jwt](https://github.com/lcobucci/jwt). Это упрощенный вариант jwt авторизации без refresh токена. Для обновления используется тот же самый просроченный access токен.

На текущий момент back-end лежит на хостинге в рабочем состоянии. Предопределено шесть связок логин/пароль:

```
 user1/passwd1
 user2/passwd2
 ...
```

## Сборка и запуск

Стандартный набор скриптов npm run start , npm run build.

Рабочая сборка на github https://alex461919-test.github.io/saga_authflow/ .
