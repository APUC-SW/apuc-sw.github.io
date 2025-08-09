<pre class="line-numbers"><code class="language-csharp">
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

/// &lt;summary&gt;
/// 간단 데모: 컬렉션, 패턴 매칭, async/await 포함
/// &lt;/summary&gt;
public static class Program
{
    public static async Task Main()
    {
        var items = new List&lt;int&gt; { 1, 2, 3, 4, 5, 15 };

        // 패턴 매칭 switch 식
        var labels = items.Select(FizzBuzz).ToList();
        Console.WriteLine(string.Join(", ", labels));

        // 비동기 메서드 호출
        Console.WriteLine(await FetchGreetingAsync("World"));

        // 튜플과 관계 패턴
        var p = (x: 3, y: -1);
        Console.WriteLine(Quadrant(p));
    }

    static string FizzBuzz(int n) =&gt; (n % 3, n % 5) switch
    {
        (0, 0) =&gt; "FizzBuzz",
        (0, _) =&gt; "Fizz",
        (_, 0) =&gt; "Buzz",
        _      =&gt; n.ToString()
    };

    static async Task&lt;string&gt; FetchGreetingAsync(string name)
    {
        await Task.Delay(50);
        var json = $"{{ \"hello\": \"{name}\", \"time\": \"{DateTime.UtcNow:O}\" }}";
        return $"Greeting: {json}";
    }

    static string Quadrant((int x, int y) p) => p switch
    {
        (&gt;0, &gt;0) =&gt; "Q1",
        (&lt;0, &gt;0) =&gt; "Q2",
        (&lt;0, &lt;0) =&gt; "Q3",
        (&gt;0, &lt;0) =&gt; "Q4",
        _        =&gt; "Axis"
    };
}
</code></pre>