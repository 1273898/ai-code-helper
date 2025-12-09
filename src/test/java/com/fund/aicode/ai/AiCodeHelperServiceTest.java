package com.fund.aicode.ai;

import dev.langchain4j.community.model.dashscope.QwenChatModel;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AiCodeHelperServiceTest {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

//    @Test
//    void chat(){
//        String result =aiCodeHelperService.chat("你好，我是一个程序员");
//        System.out.println(result);
//    }
//
//
//    @Test
//    void chatWithMemory(){
//        String result =aiCodeHelperService.chat("你好，我是一个程序员");
//        System.out.println(result);
//        result =aiCodeHelperService.chat("给我一些学习建议");
//        System.out.println(result);
//
//    }
    @Test
    void chatWithRag(){
        String result =aiCodeHelperService.chat("怎么学习java？有哪些常见的面试题？");
        System.out.println(result);
    }

}