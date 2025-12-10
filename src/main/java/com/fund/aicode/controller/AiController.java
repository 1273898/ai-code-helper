package com.fund.aicode.controller;

import com.fund.aicode.ai.AiCodeHelperService;
import jakarta.annotation.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Resource
    private AiCodeHelperService aiCodeHelperService;

    @GetMapping("/test")
    public String test() {
        return "API is working!";
    }

    @GetMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> chat(
            @RequestParam("memoryId") String memoryId,
            @RequestParam("message") String message) {
        // 将 memoryId 字符串转换为整数（使用哈希值）
        int memoryIdInt = memoryId.hashCode();
        return aiCodeHelperService.chatStream(memoryIdInt, message)
                .map(chunk -> ServerSentEvent.<String>builder()
                        .data(chunk)
                        .build())
                .concatWith(Flux.just(ServerSentEvent.<String>builder()
                        .data("[DONE]")
                        .build()));
    }
}