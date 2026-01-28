CREATE TABLE `image_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`imageUrl` text NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`visible` boolean NOT NULL DEFAULT true,
	`location` enum('home','shensuan','guanjiapo','huangdaxian') NOT NULL DEFAULT 'home',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `image_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_draws` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lotteryTypeId` int NOT NULL,
	`issueNumber` varchar(50) NOT NULL,
	`year` int NOT NULL,
	`drawTime` timestamp NOT NULL,
	`status` enum('pending','drawing','completed') NOT NULL DEFAULT 'pending',
	`number1` int,
	`number1Zodiac` varchar(20),
	`number1Color` enum('red','blue','green'),
	`number2` int,
	`number2Zodiac` varchar(20),
	`number2Color` enum('red','blue','green'),
	`number3` int,
	`number3Zodiac` varchar(20),
	`number3Color` enum('red','blue','green'),
	`number4` int,
	`number4Zodiac` varchar(20),
	`number4Color` enum('red','blue','green'),
	`number5` int,
	`number5Zodiac` varchar(20),
	`number5Color` enum('red','blue','green'),
	`number6` int,
	`number6Zodiac` varchar(20),
	`number6Color` enum('red','blue','green'),
	`specialNumber` int,
	`specialNumberZodiac` varchar(20),
	`specialNumberColor` enum('red','blue','green'),
	`nextDrawTime` timestamp,
	`nextIssueNumber` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lottery_draws_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lottery_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(100) NOT NULL,
	`isCustom` boolean NOT NULL DEFAULT false,
	`apiUrl` text,
	`intervalHours` int NOT NULL DEFAULT 2,
	`displayOrder` int NOT NULL DEFAULT 0,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lottery_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `lottery_types_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `number_attributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`number` int NOT NULL,
	`zodiac` varchar(20) NOT NULL,
	`color` enum('red','blue','green') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `number_attributes_id` PRIMARY KEY(`id`),
	CONSTRAINT `number_attributes_number_unique` UNIQUE(`number`)
);
--> statement-breakpoint
CREATE TABLE `text_blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(200) NOT NULL,
	`content` text NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`visible` boolean NOT NULL DEFAULT true,
	`location` enum('home','shensuan','guanjiapo','huangdaxian') NOT NULL DEFAULT 'home',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `text_blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zodiac_cards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text NOT NULL,
	`year` int NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `zodiac_cards_id` PRIMARY KEY(`id`)
);
