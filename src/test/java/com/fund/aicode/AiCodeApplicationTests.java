package com.fund.aicode;

import com.fund.aicode.ai.AiCodeHelper;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AiCodeApplicationTests {
    @Resource
    private AiCodeHelper aiCodeHelper;
    @Test
    void chat(){
        aiCodeHelper.chat("你好！");
    }

}
