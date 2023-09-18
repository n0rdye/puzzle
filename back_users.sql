-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 192.168.2.72
-- Время создания: Сен 18 2023 г., 11:34
-- Версия сервера: 8.1.0
-- Версия PHP: 8.2.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `users`
--

-- --------------------------------------------------------

--
-- Структура таблицы `admins`
--

CREATE TABLE `admins` (
  `id` int NOT NULL,
  `login` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `uid` int NOT NULL,
  `rights` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `admins`
--

INSERT INTO `admins` (`id`, `login`, `uid`, `rights`) VALUES
(58, 'n0rdye', 35, 3),
(91, 'admin', 72, 3),
(103, 'Stolyarchuk.E', 92, 3),
(108, 'andreeva.u', 96, 3);

-- --------------------------------------------------------

--
-- Структура таблицы `color_palette`
--

CREATE TABLE `color_palette` (
  `id` int NOT NULL,
  `color` tinytext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `color_palette`
--

INSERT INTO `color_palette` (`id`, `color`) VALUES
(20, '43368D'),
(21, '41AB34'),
(22, 'F7EA55'),
(23, 'E5231F'),
(24, 'F39223'),
(25, '009FE3'),
(26, 'CEE8EA'),
(27, 'B9D585'),
(28, 'F4F2C7'),
(29, 'E699A7'),
(30, 'F9C771'),
(31, 'B7A3C7');

-- --------------------------------------------------------

--
-- Структура таблицы `logs`
--

CREATE TABLE `logs` (
  `id` int NOT NULL,
  `date` date DEFAULT NULL,
  `time` time NOT NULL,
  `log` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `objects`
--

CREATE TABLE `objects` (
  `id` int NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `img` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `height` double NOT NULL,
  `width` double NOT NULL,
  `cost` float NOT NULL,
  `gid` int NOT NULL DEFAULT '0',
  `colors` tinyint(1) NOT NULL DEFAULT '0',
  `pid` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `objects`
--

INSERT INTO `objects` (`id`, `name`, `img`, `height`, `width`, `cost`, `gid`, `colors`, `pid`) VALUES
(81, 'KeyBoard~g~не$основное', '/img/object/KeyBoard~g~не$основное/main.jpg', 45, 100, 200, 24, 0, 1),
(98, 'Настенная$панель$домик~g~Настенные$панели~p~Оборудование', '/img/object/Настенная$панель$домик~g~Настенные$панели~p~Оборудование/main.png', 100, 64, 17420, 73, 1, 2),
(127, 'Бизиборд$«Лисичка»~g~основное~p~Оборудование', '/img/object/Бизиборд$«Лисичка»~g~основное~p~Оборудование/main.png', 30, 90, 13660, 20, 0, 2);

-- --------------------------------------------------------

--
-- Структура таблицы `object_groups`
--

CREATE TABLE `object_groups` (
  `id` int NOT NULL,
  `name` varchar(500) NOT NULL,
  `count` int NOT NULL,
  `pid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `object_groups`
--

INSERT INTO `object_groups` (`id`, `name`, `count`, `pid`) VALUES
(20, 'основное', 1, 2),
(24, 'не$основное', 7, 1),
(73, 'Настенные$панели', 1, 2);

-- --------------------------------------------------------

--
-- Структура таблицы `object_partition`
--

CREATE TABLE `object_partition` (
  `id` int NOT NULL,
  `name` varchar(1000) NOT NULL,
  `groups` longtext NOT NULL,
  `count` int NOT NULL,
  `no-cost` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `object_partition`
--

INSERT INTO `object_partition` (`id`, `name`, `groups`, `count`, `no-cost`) VALUES
(1, 'Помехи$на$стене', '24', 1, 1),
(2, 'Оборудование', '20,73', 2, 0),
(9, 'Бизиборды', '', 0, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `projects`
--

CREATE TABLE `projects` (
  `id` int NOT NULL,
  `name` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `uid` int NOT NULL,
  `body` json NOT NULL,
  `img` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `creation_date` datetime DEFAULT NULL,
  `last_change_date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `sids`
--

CREATE TABLE `sids` (
  `id` int NOT NULL,
  `sid` text NOT NULL,
  `uid` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `sids`
--

INSERT INTO `sids` (`id`, `sid`, `uid`) VALUES
(331, 'c2d58f63-52b2-4678-92f7-fb1bdeb404dc%%/#e621', 96),
(342, '468bfba7-cc8d-45b9-822b-ed9359b67942%%/#e621', 72),
(350, 'bd21222c-bd8a-460b-b3e9-32b210759720%%/#e621', 92),
(354, '5538d163-b71e-4604-aef2-5c000a577eca%%/#e621', 35);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `login` varchar(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `pass` varchar(1000) NOT NULL,
  `admin` tinyint(1) DEFAULT '0',
  `uuid` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `login`, `pass`, `admin`, `uuid`) VALUES
(35, 'n0rdye', '595', 1, '3bcb0c63-359a-4ec1-b7ad-49aa78a010ec%n0rdye%%bed10840-d365-4980-8b93-c018b5757217#621'),
(72, 'admin', 'Gfzkmybr72', 1, '19e70eed-e370-43b3-894f-8192bda656b6%%U2FsdGVkX1+Wwk7/EIIpOOysfRnlDY5Q8TgojbYWxZo=#e621'),
(76, 'voloshina.e', 'Volo1508', 0, '9c1fe660-dc56-4a0b-98c2-6eb4d7b3498a%%U2FsdGVkX18N+JSSFfr5TRLFkmGDLwlz7mhATO/pJmU=#e621'),
(91, 'sychov.a', 'Sych1808!', 0, 'f921ba23-723c-4cb4-b5a6-e24ffbb9d181%%U2FsdGVkX19C2YLx2D1IZEVNuM/qFZjWoI37vxioL2E=#e621'),
(92, 'Stolyarchuk.E', 'Sto2108!', 1, '3e5ac53e-f46e-4f9d-94fd-c761ce17c799%%U2FsdGVkX1/9C2IykLtuoHXA9isJjqBADD3+s1D5cVY=#e621'),
(96, 'andreeva.u', 'Andr2908', 1, 'c2e8cb66-5d80-4905-9cc0-4830d448960e%%andreeva.u#e621');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uid` (`uid`) USING BTREE;

--
-- Индексы таблицы `color_palette`
--
ALTER TABLE `color_palette`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `objects`
--
ALTER TABLE `objects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gid` (`gid`),
  ADD KEY `pid` (`pid`);

--
-- Индексы таблицы `object_groups`
--
ALTER TABLE `object_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `object_groups_ibfk_1` (`pid`);

--
-- Индексы таблицы `object_partition`
--
ALTER TABLE `object_partition`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uid` (`uid`);

--
-- Индексы таблицы `sids`
--
ALTER TABLE `sids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `uid` (`uid`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT для таблицы `color_palette`
--
ALTER TABLE `color_palette`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT для таблицы `logs`
--
ALTER TABLE `logs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5417;

--
-- AUTO_INCREMENT для таблицы `objects`
--
ALTER TABLE `objects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT для таблицы `object_groups`
--
ALTER TABLE `object_groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT для таблицы `object_partition`
--
ALTER TABLE `object_partition`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT для таблицы `sids`
--
ALTER TABLE `sids`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=355;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Ограничения внешнего ключа таблицы `objects`
--
ALTER TABLE `objects`
  ADD CONSTRAINT `objects_ibfk_1` FOREIGN KEY (`gid`) REFERENCES `object_groups` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  ADD CONSTRAINT `objects_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `object_partition` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Ограничения внешнего ключа таблицы `object_groups`
--
ALTER TABLE `object_groups`
  ADD CONSTRAINT `object_groups_ibfk_1` FOREIGN KEY (`pid`) REFERENCES `object_partition` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Ограничения внешнего ключа таблицы `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

--
-- Ограничения внешнего ключа таблицы `sids`
--
ALTER TABLE `sids`
  ADD CONSTRAINT `sids_ibfk_1` FOREIGN KEY (`uid`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
