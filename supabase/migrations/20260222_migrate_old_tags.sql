-- 旧タグ「仕事・学習」→「仕事」に更新
UPDATE activities
SET tags = array_replace(tags, '仕事・学習', '仕事');
