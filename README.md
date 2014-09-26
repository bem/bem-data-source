bem-data-source
===============

Инструмент для версионированной сборки документации и примеров библиотек для проектов bem-info.

## Установка

* клонировать репозиторий `git clone git://github.com/bem/bem-data-source.git`
* перейти в директорию со скаченным проектом `cd bem-data-source`
* установить npm зависимости коммандой `npm install`

После установки зависимостей конфигурационный файл `config/credentials.json`.

## Конфигурирование

Конфигурация инструмента описывается в файлах `config/config.json`, `config/credentials.json`.

### Файл config/config.json

* `logLevel` - флаг уровня логгирования. может принимать значения: ("verbose", "debug", "info", "warn", "error")
* `languages` - массив локалей
* `server` - объект с полями: `host` - хост сервера, `port` - порт сервера

Примечание: Параметр server необходимо использовать для реализации сборки с
использованием команды `publish`.

### Файл config/credentials.json

Файл с токенами доступа к публичным и приватным репозиториям (github.com и github.yandex-team.ru соответственно)
Необходимо сгенерировать токены доступа в настройках профиля пользователя на github.com и github.yandex.team.ru
и вставить как значения соответствующих token-полей в данном файле.

```
"credentials": {
    "public": "",
    "private": ""
}
```

Также в этом файле настраивается конфигурация для доступа целевому репозиторию
в который будет помещен результат сборки, например:

```
"dataConfig": {
    "private": false,
    "user": "bem",
    "repo": "bem-info-libs",
    "ref": "master"
}
```
Здесь: 

* `private` - обозначает приватность github хоста на котором хранится репозиторий. 

`false` - для публичного гитхаба `github.com`
`true` - для корпоративного гитхаба.

* `user` - имя пользователя или название организации.
* `repo` - название рапозитория
* `ref` - название ветки (по умолчанию "master")

## [Декларации для сборки библиотеки](./docs/declarations.md)
 
## [Описание модулей для сборки](./docs/tasks.md)

## Запуск

Запуск выполняется командой `node bin/ds make` с указанием дополнительных опций:

* `-p` или `--private`, если репозиторий внутренний
* `-u` или `--user` - имя пользователя или название организации (обязательный параметр)
* `-r` или `--repo` - название репозитория (обязательный параметр)
* `-t` или `--tags` - название версии (тега) библиотеки
* `-b` или `--branches` - название ветки библиотеки

## Дополнительные комманды

### Замена документа в собранных данных библиотеки

Выполняется командой `node bin/ds replace-doc` с указанием дополнительных опций:

* `-r` или `--repo` - название репозитория (обязательный параметр)
* `-v` или `--version` - название версии (тега или ветки) библиотеки (обязательный параметр)
* `-d` или `--doc` - ключ документа в сборки библиотеки ('readme', 'changelog', 'migration', ...) (обязательный параметр)
* `-l` или `--lang` - языковая версия заменяемого документа. Если этот параметр неуказан, то будут заменены
все яызковые версии документа, указанного в параметре `-d`.
* `-u` или `--url` - url для `*.md` файла источника замены на github, например: 

### Удаление версии библиотеки из репозитория с собранными данными

Выполняется командой `node bin/ds remove` с указанием дополнительных опций:

* `-r` или `--repo` - название репозитория (обязательный параметр)
* `-v` или `--version` - название версии (тега или ветки) библиотеки (обязательный параметр)

Посмотреть текущую версию приложения можно выполнив команду: `node bin/ds -v`

## Использование bem-data-source в режиме сервера.

Сборку данных можно реализовать другим способом. Допустим, что сборка ваших библиотек
осуществляется с помощью вашего собственного инструмента. Но для отображения собранной документации
на сайте необходимо сделать некую пост-обработку этих данных и сложить их github репозиторий
(что делается при обычном режиме запуска).

В этом случае на базе установленного bem-data-source можно поднять удаленный сервер с помощью команды
```
node bin/ds server
```
Это обычный express сервер, который принимает собранные данные по библиотеке, раскладывает их
консистентно на файловую систему и синхронизирует данные с github репозиторием который указан в
конфигурации приложения bem-data-source.

Находясь в директории целевой библиотеки блоков, после сборки примеров и документации
можно вызвать команду `publish` которая упакует собранные данные в формат необходимый для сайта,
скопирует и заархивирует необходимые файлы примеров и отправит собранный архив
на url: `http://{host}:{port}/publish/{lib}/{version}`, где:

* host - хост на котором поднят удаленный bem-data-source сервер.
* port - port на котором поднят удаленный bem-data-source сервер.
* lib - название собранной библиотеки.
* version -  версия собранной библиотеки.

Команду publish можно выполнить двумя способами:

Как shell команду:
```
node {path to bem-data-source}/bin/ds publish [-v version]
```
Где `-v` - необязательный параметр названия версии (ветка, тег, пулл-реквест).
Если этот параметр не будет указан, то название версии будет выбрано из файла `package.json`

Из другого `node.js` скрипта:

```
var ds = require('bem-data-source');
ds.publish(version, options, dryMode);
```

* `version` - обязательный параметр названия версии (ветка, тег, пулл-реквест)
* `options` - объект с полями `host` и `port`. Соответственно хост и порт удаленного
bem-data-source сервера.
* `dryMode` - необязательный флаг. Если данный параметр выставлен в значение true,
то отправка собранных и заархивированных данных на сервер будет отменена и вмето этого
пользователю будет выдано соответствующее сообщение.

Ответственный за разработку @bemer

Вопросы и пожелания присылать по адресу: bemer@yandex-team.ru
